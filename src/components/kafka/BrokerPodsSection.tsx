import {
  ResourceTable,
  type ResourceTableColumn,
  SectionBox,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import type { KubeObject } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import Pod from '@kinvolk/headlamp-plugin/lib/k8s/pod';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { Kafka } from '../../resources/kafka';

type BrokerPodsSectionProps = {
  kafka: Kafka | null;
};

function makePodStatusLabel(pod: Pod) {
  const phase = pod.status?.phase ?? 'Unknown';
  const status = pod.getDetailedStatus();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <StatusLabel status={phase} />
      {status.restarts > 0 && (
        <Chip
          size="small"
          label={`${status.restarts} restart${status.restarts !== 1 ? 's' : ''}`}
          color="warning"
          variant="outlined"
        />
      )}
    </Box>
  );
}

export function BrokerPodsSection({ kafka }: BrokerPodsSectionProps) {
  // Always call hooks in the same order - don't return early
  const namespace = kafka?.getNamespace();
  const cluster = kafka?.cluster;
  const clusterName = kafka?.getName();

  // Strimzi labels Kafka broker pods with:
  // - strimzi.io/cluster: cluster name
  // - strimzi.io/kind: "Kafka"
  // - app.kubernetes.io/name: "kafka"
  // - app.kubernetes.io/instance: cluster name
  // We'll use the Strimzi-specific labels for more precise matching
  const labelSelector = clusterName
    ? `strimzi.io/cluster=${clusterName},strimzi.io/kind=Kafka`
    : undefined;

  const {
    items: pods,
    error,
    errors,
  } = Pod.useList({
    namespace,
    cluster,
    labelSelector,
  });

  // Handle null kafka case after hooks are called
  if (!kafka) {
    return null;
  }

  const podStatusCounts = (pods ?? []).reduce<Record<string, number>>((counts, pod) => {
    const phase = pod.status?.phase ?? 'Unknown';
    counts[phase] = (counts[phase] ?? 0) + 1;
    return counts;
  }, {});

  const podStatusOrder = ['Running', 'Pending', 'Succeeded', 'Failed', 'Unknown'];
  const podStatusEntries = Object.entries(podStatusCounts).sort(([a], [b]) => {
    const ai = podStatusOrder.indexOf(a);
    const bi = podStatusOrder.indexOf(b);
    const aOrder = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bOrder = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    return aOrder - bOrder || a.localeCompare(b);
  });

  const columns: (ResourceTableColumn<KubeObject> | 'name' | 'age')[] = [
    'name',
    {
      id: 'role',
      label: 'Role',
      gridTemplate: 'min-content',
      disableFiltering: true,
      getValue: item => {
        const pod = item as unknown as Pod;
        const roleLabel = pod.metadata.labels?.['strimzi.io/pool-name'];
        return roleLabel || 'N/A';
      },
      render: item => {
        const pod = item as unknown as Pod;
        const roleLabel = pod.metadata.labels?.['strimzi.io/pool-name'];
        if (!roleLabel) {
          return (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          );
        }
        return (
          <Chip
            size="small"
            variant="outlined"
            label={roleLabel}
            sx={{ maxWidth: '100%' }}
          />
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      gridTemplate: 'min-content',
      disableFiltering: true,
      getValue: item => {
        const pod = item as unknown as Pod;
        return pod.status?.phase ?? 'Unknown';
      },
      render: item => makePodStatusLabel(item as unknown as Pod),
    },
    {
      id: 'ready',
      label: 'Ready',
      gridTemplate: 'min-content',
      disableFiltering: true,
      getValue: item => {
        const pod = item as unknown as Pod;
        const { readyContainers, totalContainers } = pod.getDetailedStatus();
        if (!totalContainers) return 0;
        return readyContainers / totalContainers;
      },
      render: item => {
        const pod = item as unknown as Pod;
        const { readyContainers, totalContainers } = pod.getDetailedStatus();
        return (
          <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
            {readyContainers}/{totalContainers}
          </Box>
        );
      },
    },
    {
      id: 'restarts',
      label: 'Restarts',
      gridTemplate: 'min-content',
      disableFiltering: true,
      getValue: item => (item as unknown as Pod).getDetailedStatus().restarts ?? 0,
      render: item => (item as unknown as Pod).getDetailedStatus().restarts ?? 0,
    },
    {
      id: 'node',
      label: 'Node',
      gridTemplate: 'min-content',
      getValue: item => (item as unknown as Pod).spec?.nodeName || 'N/A',
    },
    'age',
  ];

  if (error || errors) {
    return (
      <SectionBox title="Broker Pods">
        <Typography color="error">
          Error loading broker pods: {error?.message || errors?.[0]?.message || 'Unknown error'}
        </Typography>
      </SectionBox>
    );
  }

  if (!pods || pods.length === 0) {
    return (
      <SectionBox title="Broker Pods">
        <Stack spacing={1}>
          <Typography color="text.secondary">
            No broker pods found for this cluster.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            Looking for pods with labels: strimzi.io/cluster={clusterName}, strimzi.io/kind=Kafka
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This usually means:
            <ul style={{ marginTop: '4px', marginBottom: '4px', paddingLeft: '20px' }}>
              <li>The Kafka cluster is still being deployed (check cluster status above)</li>
              <li>The Strimzi operator hasn't created the pods yet</li>
              <li>The cluster name or namespace might be incorrect</li>
            </ul>
            To check manually, run:{' '}
            <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
              kubectl get pods -n {namespace} -l strimzi.io/cluster={clusterName},strimzi.io/kind=Kafka
            </code>
          </Typography>
        </Stack>
      </SectionBox>
    );
  }

  return (
    <SectionBox title="Broker Pods">
      <Stack spacing={2}>
        {/* Status Summary */}
        {podStatusEntries.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Status Summary
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {podStatusEntries.map(([phase, count]) => (
                <Chip
                  key={phase}
                  size="small"
                  label={`${phase}: ${count}`}
                  color={
                    phase === 'Running'
                      ? 'success'
                      : phase === 'Pending'
                      ? 'warning'
                      : phase === 'Failed'
                      ? 'error'
                      : 'default'
                  }
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Pods Table */}
        <ResourceTable.default
          columns={columns}
          data={pods}
          id="kafka-broker-pods"
          reflectInURL={false}
        />
      </Stack>
    </SectionBox>
  );
}
