#!/bin/bash

# Setup script for Strimzi Headlamp Plugin Test Resources
# This script creates all necessary test resources to demonstrate the plugin functionality

set -e

NAMESPACE="kafka"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Setting up Strimzi Headlamp Plugin Test Resources"
echo "=================================================="
echo ""

# Check if namespace exists, create if not
if ! kubectl get namespace "$NAMESPACE" &>/dev/null; then
    echo "📦 Creating namespace: $NAMESPACE"
    kubectl create namespace "$NAMESPACE"
    echo "✅ Namespace created"
else
    echo "✅ Namespace '$NAMESPACE' already exists"
fi
echo ""

# Check if Strimzi operator is running
echo "🔍 Checking Strimzi Cluster Operator..."
if ! kubectl get deployment -n "$NAMESPACE" strimzi-cluster-operator &>/dev/null; then
    echo "⚠️  Warning: Strimzi Cluster Operator not found in namespace '$NAMESPACE'"
    echo "   Please ensure Strimzi is installed. You may need to install it first."
    echo "   See: https://strimzi.io/docs/operators/latest/deploying.html"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Strimzi Cluster Operator found"
fi
echo ""

# Check for existing Kafka cluster
KAFKA_CLUSTER="test-cluster"
if kubectl get kafka "$KAFKA_CLUSTER" -n "$NAMESPACE" &>/dev/null; then
    echo "✅ Kafka cluster '$KAFKA_CLUSTER' already exists"
else
    echo "📝 Creating Kafka cluster: $KAFKA_CLUSTER"
    cat <<EOF | kubectl apply -f -
apiVersion: kafka.strimzi.io/v1
kind: Kafka
metadata:
  name: $KAFKA_CLUSTER
  namespace: $NAMESPACE
spec:
  kafka:
    version: 4.1.1
    replicas: 1
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: tls
        port: 9093
        type: internal
        tls: true
    config:
      offsets.topic.replication.factor: 1
      transaction.state.log.replication.factor: 1
      transaction.state.log.min.isr: 1
      default.replication.factor: 1
      min.insync.replicas: 1
    storage:
      type: ephemeral
  zookeeper:
    replicas: 1
    storage:
      type: ephemeral
  entityOperator:
    topicOperator: {}
    userOperator: {}
EOF
    echo "✅ Kafka cluster created"
    echo "⏳ Waiting for Kafka cluster to be ready (this may take a few minutes)..."
    kubectl wait --for=condition=Ready kafka/$KAFKA_CLUSTER -n $NAMESPACE --timeout=600s || {
        echo "⚠️  Kafka cluster is taking longer than expected to become ready"
        echo "   You can check status with: kubectl get kafka $KAFKA_CLUSTER -n $NAMESPACE"
    }
fi
echo ""

# Create KafkaTopic
echo "📝 Creating KafkaTopic: test-topic"
cat <<EOF | kubectl apply -f -
apiVersion: kafka.strimzi.io/v1
kind: KafkaTopic
metadata:
  name: test-topic
  namespace: $NAMESPACE
  labels:
    strimzi.io/cluster: $KAFKA_CLUSTER
spec:
  partitions: 3
  replicas: 1
  config:
    retention.ms: 7200000
    segment.ms: 3600000
EOF
echo "✅ KafkaTopic created"
echo ""

# Create KafkaUser
echo "📝 Creating KafkaUser: test-user"
cat <<EOF | kubectl apply -f -
apiVersion: kafka.strimzi.io/v1
kind: KafkaUser
metadata:
  name: test-user
  namespace: $NAMESPACE
  labels:
    strimzi.io/cluster: $KAFKA_CLUSTER
spec:
  authentication:
    type: scram-sha-512
  authorization:
    type: simple
    acls:
      - resource:
          type: topic
          name: test-topic
          patternType: literal
        operations:
          - Read
          - Describe
        host: "*"
      - resource:
          type: topic
          name: test-topic
          patternType: literal
        operations:
          - Write
          - Create
        host: "*"
      - resource:
          type: group
          name: test-group
          patternType: literal
        operations:
          - Read
        host: "*"
EOF
echo "✅ KafkaUser created"
echo ""

# Create KafkaConnect cluster
CONNECT_CLUSTER="my-connect-cluster"
if kubectl get kafkaconnect "$CONNECT_CLUSTER" -n "$NAMESPACE" &>/dev/null; then
    echo "✅ KafkaConnect cluster '$CONNECT_CLUSTER' already exists"
else
    echo "📝 Creating KafkaConnect cluster: $CONNECT_CLUSTER"
    cat <<EOF | kubectl apply -f -
apiVersion: kafka.strimzi.io/v1
kind: KafkaConnect
metadata:
  name: $CONNECT_CLUSTER
  namespace: $NAMESPACE
  labels:
    app: strimzi
  annotations:
    strimzi.io/use-connector-resources: "true"
spec:
  replicas: 1
  bootstrapServers: $KAFKA_CLUSTER-kafka-bootstrap:9092
  version: 4.1.1
  groupId: connect-cluster
  configStorageTopic: connect-cluster-configs
  offsetStorageTopic: connect-cluster-offsets
  statusStorageTopic: connect-cluster-status
  config:
    config.storage.replication.factor: -1
    offset.storage.replication.factor: -1
    status.storage.replication.factor: -1
EOF
    echo "✅ KafkaConnect cluster created"
    echo "⏳ Waiting for KafkaConnect cluster to be ready (this may take a few minutes)..."
    kubectl wait --for=condition=Ready kafkaconnect/$CONNECT_CLUSTER -n $NAMESPACE --timeout=600s || {
        echo "⚠️  KafkaConnect cluster is taking longer than expected to become ready"
        echo "   You can check status with: kubectl get kafkaconnect $CONNECT_CLUSTER -n $NAMESPACE"
    }
fi
echo ""

# Create KafkaConnector (only if Connect is ready)
if kubectl get kafkaconnect "$CONNECT_CLUSTER" -n "$NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null | grep -q "True"; then
    if kubectl get kafkaconnector my-connector -n "$NAMESPACE" &>/dev/null; then
        echo "✅ KafkaConnector 'my-connector' already exists"
    else
        echo "📝 Creating KafkaConnector: my-connector"
        cat <<EOF | kubectl apply -f -
apiVersion: kafka.strimzi.io/v1
kind: KafkaConnector
metadata:
  name: my-connector
  namespace: $NAMESPACE
  labels:
    strimzi.io/cluster: $CONNECT_CLUSTER
spec:
  class: org.apache.kafka.connect.file.FileStreamSourceConnector
  tasksMax: 2
  config:
    file: "/tmp/test.txt"
    topic: test-topic
EOF
        echo "✅ KafkaConnector created"
    fi
else
    echo "⏭️  Skipping KafkaConnector creation (KafkaConnect cluster not ready yet)"
    echo "   You can create it later with: kubectl apply -f $SCRIPT_DIR/test-kafka-connector.yaml"
fi
echo ""

# Summary
echo "=================================================="
echo "✅ Setup Complete!"
echo ""
echo "📊 Test Resources Created:"
echo "   • Kafka Cluster: $KAFKA_CLUSTER"
echo "   • KafkaTopic: test-topic"
echo "   • KafkaUser: test-user"
echo "   • KafkaConnect: $CONNECT_CLUSTER"
if kubectl get kafkaconnector my-connector -n "$NAMESPACE" &>/dev/null; then
    echo "   • KafkaConnector: my-connector"
fi
echo ""
echo "🔍 Check Status:"
echo "   kubectl get kafka,kafkatopic,kafkauser,kafkaconnect,kafkaconnector -n $NAMESPACE"
echo ""
echo "🌐 View in Headlamp:"
echo "   • Strimzi → Kafka Clusters → $KAFKA_CLUSTER"
echo "   • Strimzi → Kafka Topics → test-topic"
echo "   • Strimzi → Kafka Users → test-user"
echo "   • Strimzi → Kafka Connect → $CONNECT_CLUSTER"
if kubectl get kafkaconnector my-connector -n "$NAMESPACE" &>/dev/null; then
    echo "   • Strimzi → Kafka Connectors → my-connector"
fi
echo ""
echo "🧹 To Clean Up (delete all test resources):"
echo "   kubectl delete kafka $KAFKA_CLUSTER -n $NAMESPACE"
echo "   kubectl delete kafkatopic test-topic -n $NAMESPACE"
echo "   kubectl delete kafkauser test-user -n $NAMESPACE"
echo "   kubectl delete kafkaconnect $CONNECT_CLUSTER -n $NAMESPACE"
echo "   kubectl delete kafkaconnector my-connector -n $NAMESPACE 2>/dev/null || true"
echo ""
