import { KubeObject } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';

export interface Condition {
  type: string;
  status: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface StrimziKafkaTopic extends KubeObjectInterface {
  spec: {
    topicName?: string;
    partitions?: number;
    replicas?: number;
    config?: Record<string, any>;
  };
  status?: {
    conditions?: Condition[];
    observedGeneration?: number;
    topicName?: string;
  };
}

export class KafkaTopic extends KubeObject<StrimziKafkaTopic> {
  static kind = 'KafkaTopic';
  static apiName = 'kafkatopics';
  static apiVersion = 'kafka.strimzi.io/v1';
  static isNamespaced = true;

  // Check if the topic is ready
  get ready() {
    return (
      this.status?.conditions?.find(condition => condition.type === 'Ready')?.status === 'True'
    );
  }

  // Get partition count from spec
  get partitions() {
    return this.spec?.partitions || 'N/A';
  }

  // Get replica count from spec
  get replicas() {
    return this.spec?.replicas || 'N/A';
  }

  // Get the actual topic name (from status if available, otherwise from spec or metadata)
  get topicName() {
    return this.status?.topicName || this.spec?.topicName || this.getName();
  }

  // Get the cluster name from labels
  get clusterName() {
    return this.metadata?.labels?.['strimzi.io/cluster'] || 'N/A';
  }

  // Note: This workaround is needed to make the plugin compatible with older versions of Headlamp
  static get listRoute() {
    return '/strimzi/topics';
  }

  static get detailsRoute() {
    return '/strimzi/topics/:namespace/:name';
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
