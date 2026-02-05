import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KafkaConnect } from '../../resources/kafkaconnect';

export function ConnectList() {
  return (
    <ResourceListView
      title="Kafka Connect Clusters"
      resourceClass={KafkaConnect}
      columns={[
        'name',
        'namespace',
        {
          id: 'replicas',
          label: 'Replicas',
          getValue: item => item.replicas.toString(),
        },
        {
          id: 'version',
          label: 'Version',
          getValue: item => item.version,
        },
        {
          id: 'status',
          label: 'Status',
          getValue: item => (item.ready ? 'Ready' : 'Not Ready'),
        },
        'age',
      ]}
    />
  );
}
