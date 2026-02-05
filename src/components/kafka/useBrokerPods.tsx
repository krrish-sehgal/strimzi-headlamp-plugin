import Pod from '@kinvolk/headlamp-plugin/lib/k8s/pod';
import { Kafka } from '../../resources/kafka';

export function useBrokerPods(kafka: Kafka | null) {
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

  // If no kafka or no pods, return early values
  if (!kafka) {
    return { pods: [], runningCount: 0, totalCount: 0, error: null };
  }

  const runningCount = (pods ?? []).filter(
    pod => pod.status?.phase === 'Running'
  ).length;
  const totalCount = pods?.length ?? 0;

  return {
    pods: pods ?? [],
    runningCount,
    totalCount,
    error: error || errors?.[0] || null,
  };
}
