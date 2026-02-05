import { KubeObject } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';

export interface Condition {
  type: string;
  status: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface StrimziKafkaConnect extends KubeObjectInterface {
  spec: {
    replicas?: number;
    version?: string;
    bootstrapServers?: string;
    groupId?: string;
    configStorageTopic?: string;
    offsetStorageTopic?: string;
    statusStorageTopic?: string;
    authentication?: Record<string, any>;
    config?: Record<string, any>;
  };
  status?: {
    conditions?: Condition[];
    observedGeneration?: number;
    url?: string;
    replicas?: number;
  };
}

export class KafkaConnect extends KubeObject<StrimziKafkaConnect> {
  static kind = 'KafkaConnect';
  static apiName = 'kafkaconnects';
  static apiVersion = 'kafka.strimzi.io/v1';
  static isNamespaced = true;

  // Check if the Kafka Connect cluster is ready
  get ready() {
    return (
      this.status?.conditions?.find(condition => condition.type === 'Ready')?.status === 'True'
    );
  }

  // Get replica count
  get replicas() {
    return this.spec?.replicas || this.status?.replicas || 0;
  }

  // Get version
  get version() {
    return this.spec?.version || 'N/A';
  }

  // Get URL
  get url() {
    return this.status?.url || 'N/A';
  }

  // Note: This workaround is needed to make the plugin compatible with older versions of Headlamp
  static get listRoute() {
    return '/strimzi/connect';
  }

  static get detailsRoute() {
    return '/strimzi/connect/:namespace/:name';
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
