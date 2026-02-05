import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { useParams } from 'react-router-dom';
import { KafkaConnect } from '../../resources/kafkaconnect';
import { ConnectRestartButton } from './ConnectRestartButton';

export function ConnectDetail() {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();

  return (
    <DetailsGrid
      resourceType={KafkaConnect}
      name={name}
      namespace={namespace}
      withEvents
      extraInfo={item =>
        item && [
          {
            name: 'Status',
            value: item.ready ? 'Ready' : 'Not Ready',
          },
          {
            name: 'Replicas',
            value: item.replicas.toString(),
          },
          {
            name: 'Version',
            value: item.version,
          },
          {
            name: 'URL',
            value: item.url,
          },
        ]
      }
      extraSections={item =>
        item && [
          {
            id: 'Restart',
            section: (
              <SectionBox
                title="Cluster Management"
                headerProps={{
                  titleSideActions: [<ConnectRestartButton key="restart" connect={item} />],
                }}
              >
                <div>Use the restart button to trigger a rolling update of the Kafka Connect cluster.</div>
              </SectionBox>
            ),
          },
          {
            id: 'Configuration',
            section: item.spec?.config && Object.keys(item.spec.config).length > 0 && (
              <SectionBox title="Connect Configuration">
                <NameValueTable
                  rows={Object.entries(item.spec.config).map(([key, value]) => ({
                    name: key,
                    value: String(value),
                  }))}
                />
              </SectionBox>
            ),
          },
          {
            id: 'Status',
            section: item.status && (
              <SectionBox title="Status">
                {item.status.conditions && item.status.conditions.length > 0 ? (
                  <NameValueTable
                    rows={item.status.conditions.map(condition => ({
                      name: condition.type,
                      value: (
                        <div>
                          <div>Status: {condition.status}</div>
                          {condition.reason && <div>Reason: {condition.reason}</div>}
                          {condition.message && <div>Message: {condition.message}</div>}
                          {condition.lastTransitionTime && (
                            <div>Last Transition: {condition.lastTransitionTime}</div>
                          )}
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <div>No status conditions available</div>
                )}
              </SectionBox>
            ),
          },
        ]
      }
    />
  );
}
