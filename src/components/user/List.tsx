import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KafkaUser } from '../../resources/kafkauser';

export function UserList() {
  return (
    <ResourceListView
      title="Kafka Users"
      resourceClass={KafkaUser}
      columns={[
        'name',
        'namespace',
        {
          id: 'cluster',
          label: 'Cluster',
          getValue: item => item.clusterName,
        },
        {
          id: 'authentication',
          label: 'Authentication',
          getValue: item => item.authenticationType,
        },
        {
          id: 'authorization',
          label: 'Authorization',
          getValue: item => item.authorizationType,
        },
        {
          id: 'acls',
          label: 'ACLs',
          getValue: item => item.aclCount.toString(),
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
