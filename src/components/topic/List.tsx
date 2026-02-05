import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KafkaTopic } from '../../resources/kafkatopic';

export function TopicList() {
  return (
    <ResourceListView
      title="Kafka Topics"
      resourceClass={KafkaTopic}
      columns={[
        'name',
        'namespace',
        {
          id: 'cluster',
          label: 'Cluster',
          getValue: item => item.clusterName,
        },
        {
          id: 'partitions',
          label: 'Partitions',
          getValue: item => item.partitions,
        },
        {
          id: 'replicas',
          label: 'Replicas',
          getValue: item => item.replicas,
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
