import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Kafka } from '../../resources/kafka';

export function KafkaList() {
  return (
    <ResourceListView
      title="Kafka Clusters"
      resourceClass={Kafka}
      columns={[
        'name',
        'namespace',
        {
          id: 'status',
          label: 'Status',
          getValue: item => (item.ready ? 'Ready' : 'Not Ready'),
        },
        {
          id: 'version',
          label: 'Kafka Version',
          getValue: item => item.version,
        },
        'age',
      ]}
    />
  );
}
