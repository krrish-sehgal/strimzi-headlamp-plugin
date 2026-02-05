import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { useParams } from 'react-router-dom';
import { KafkaTopic } from '../../resources/kafkatopic';

export function TopicDetail() {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();

  return (
    <DetailsGrid
      resourceType={KafkaTopic}
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
            name: 'Topic Name',
            value: item.topicName,
          },
          {
            name: 'Cluster',
            value: item.clusterName,
          },
          {
            name: 'Partitions',
            value: item.partitions?.toString() || 'N/A',
          },
          {
            name: 'Replicas',
            value: item.replicas?.toString() || 'N/A',
          },
        ]
      }
      extraSections={item =>
        item && [
          {
            id: 'Configuration',
            section: item.spec?.config && Object.keys(item.spec.config).length > 0 && (
              <SectionBox title="Topic Configuration">
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
                {item.status.topicName && (
                  <NameValueTable
                    rows={[
                      {
                        name: 'Actual Topic Name',
                        value: item.status.topicName,
                      },
                    ]}
                  />
                )}
              </SectionBox>
            ),
          },
        ]
      }
    />
  );
}
