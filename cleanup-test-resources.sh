#!/bin/bash

# Cleanup script for Strimzi Headlamp Plugin Test Resources
# This script deletes all test resources created by setup-test-resources.sh

set -e

NAMESPACE="kafka"

echo "🧹 Cleaning up Strimzi Headlamp Plugin Test Resources"
echo "=================================================="
echo ""

# Delete resources in reverse order of dependencies
echo "🗑️  Deleting KafkaConnector..."
kubectl delete kafkaconnector my-connector -n "$NAMESPACE" 2>/dev/null || echo "   (not found, skipping)"

echo "🗑️  Deleting KafkaConnect cluster..."
kubectl delete kafkaconnect my-connect-cluster -n "$NAMESPACE" 2>/dev/null || echo "   (not found, skipping)"

echo "🗑️  Deleting KafkaUser..."
kubectl delete kafkauser test-user -n "$NAMESPACE" 2>/dev/null || echo "   (not found, skipping)"

echo "🗑️  Deleting KafkaTopic..."
kubectl delete kafkatopic test-topic -n "$NAMESPACE" 2>/dev/null || echo "   (not found, skipping)"

echo "🗑️  Deleting Kafka cluster..."
kubectl delete kafka test-cluster -n "$NAMESPACE" 2>/dev/null || echo "   (not found, skipping)"

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "ℹ️  Note: Resources may take a few moments to fully delete."
echo "   Check status with: kubectl get kafka,kafkatopic,kafkauser,kafkaconnect,kafkaconnector -n $NAMESPACE"
