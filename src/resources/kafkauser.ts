import { KubeObject } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';

export interface Condition {
  type: string;
  status: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface ACLRule {
  type?: 'allow' | 'deny';
  resource: {
    type: 'topic' | 'group' | 'cluster' | 'transactionalId';
    name?: string;
    patternType?: 'literal' | 'prefix';
  };
  operations: string[];
  host?: string;
}

export interface StrimziKafkaUser extends KubeObjectInterface {
  spec: {
    authentication?: {
      type: 'tls' | 'tls-external' | 'scram-sha-512';
      password?: {
        valueFrom: {
          secretKeyRef: {
            name: string;
            key: string;
            optional?: boolean;
          };
        };
      };
    };
    authorization?: {
      type: 'simple';
      acls?: ACLRule[];
    };
    quotas?: {
      producerByteRate?: number;
      consumerByteRate?: number;
      requestPercentage?: number;
      controllerMutationRate?: number;
    };
  };
  status?: {
    conditions?: Condition[];
    observedGeneration?: number;
    username?: string;
  };
}

export class KafkaUser extends KubeObject<StrimziKafkaUser> {
  static kind = 'KafkaUser';
  static apiName = 'kafkausers';
  static apiVersion = 'kafka.strimzi.io/v1';
  static isNamespaced = true;

  // Check if the user is ready
  get ready() {
    return (
      this.status?.conditions?.find(condition => condition.type === 'Ready')?.status === 'True'
    );
  }

  // Get authentication type
  get authenticationType() {
    return this.spec?.authentication?.type || 'None';
  }

  // Get authorization type
  get authorizationType() {
    return this.spec?.authorization?.type || 'None';
  }

  // Get ACL count
  get aclCount() {
    return this.spec?.authorization?.acls?.length || 0;
  }

  // Get the cluster name from labels
  get clusterName() {
    return this.metadata?.labels?.['strimzi.io/cluster'] || 'N/A';
  }

  // Get ACL rules
  get acls() {
    return this.spec?.authorization?.acls || [];
  }

  // Get quotas
  get quotas() {
    return this.spec?.quotas;
  }

  // Note: This workaround is needed to make the plugin compatible with older versions of Headlamp
  static get listRoute() {
    return '/strimzi/users';
  }

  static get detailsRoute() {
    return '/strimzi/users/:namespace/:name';
  }

  // Get status
  get status() {
    return this.jsonData.status;
  }

  // Get spec
  get spec() {
    return this.jsonData.spec;
  }
}
