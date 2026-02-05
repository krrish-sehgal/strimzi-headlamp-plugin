import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { useParams } from 'react-router-dom';
import { Kafka } from '../../resources/kafka';
import { BrokerPodsSection } from './BrokerPodsSection';
import { useBrokerPods } from './useBrokerPods';

function KafkaDetailContent() {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();
  const [kafka] = Kafka.useGet(name, namespace);
  const { runningCount, totalCount } = useBrokerPods(kafka);

  return (
    <DetailsGrid
      resourceType={Kafka}
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
            name: 'Kafka Version',
            value: item.version,
          },
          {
            name: 'Metadata Version',
            value: item.spec?.kafka?.metadataVersion || 'N/A',
          },
          {
            name: 'Replicas',
            value: item.spec?.kafka?.replicas?.toString() || 'N/A',
          },
          {
            name: 'Broker Pods',
            value:
              totalCount > 0
                ? `${runningCount}/${totalCount} Running`
                : 'No broker pods found',
          },
        ]
      }
      extraSections={item =>
        item && [
          {
            id: 'Listeners',
            section: item.spec?.kafka?.listeners && item.spec.kafka.listeners.length > 0 && (
              <SectionBox title="Listeners">
                <NameValueTable
                  rows={item.spec.kafka.listeners.map((listener, index) => ({
                    name: `Listener ${index + 1}`,
                    value: (
                      <NameValueTable
                        rows={[
                          { name: 'Name', value: listener.name },
                          { name: 'Port', value: listener.port?.toString() },
                          { name: 'Type', value: listener.type },
                          { name: 'TLS', value: listener.tls ? 'Yes' : 'No' },
                        ]}
                      />
                    ),
                  }))}
                />
              </SectionBox>
            ),
          },
          {
            id: 'Configuration',
            section: item.spec?.kafka?.config && (
              <SectionBox title="Kafka Configuration">
                <NameValueTable
                  rows={Object.entries(item.spec.kafka.config).map(([key, value]) => ({
                    name: key,
                    value: String(value),
                  }))}
                />
              </SectionBox>
            ),
          },
          {
            id: 'Entity Operator',
            section: item.spec?.entityOperator && (
              <SectionBox title="Entity Operator">
                <NameValueTable
                  rows={[
                    {
                      name: 'Topic Operator',
                      value: item.spec.entityOperator.topicOperator ? 'Enabled' : 'Disabled',
                    },
                    {
                      name: 'User Operator',
                      value: item.spec.entityOperator.userOperator ? 'Enabled' : 'Disabled',
                    },
                  ]}
                />
              </SectionBox>
            ),
          },
          {
            id: 'BrokerPods',
            section: <BrokerPodsSection kafka={item} />,
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

export function KafkaDetail() {
  return <KafkaDetailContent />;
}
