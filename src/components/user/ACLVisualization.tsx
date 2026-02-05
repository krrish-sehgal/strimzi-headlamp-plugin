import { Box, Chip, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { ACLRule } from '../../resources/kafkauser';

interface ACLVisualizationProps {
  acls: ACLRule[];
}

export function ACLVisualization({ acls }: ACLVisualizationProps) {
  if (!acls || acls.length === 0) {
    return <Typography color="text.secondary">No ACL rules configured</Typography>;
  }

  const getOperationColor = (operation: string) => {
    const readOps = ['Read', 'Describe', 'DescribeConfigs'];
    const writeOps = ['Write', 'Create', 'Delete', 'Alter', 'AlterConfigs', 'IdempotentWrite'];
    const adminOps = ['ClusterAction', 'All'];

    if (readOps.includes(operation)) return 'info';
    if (writeOps.includes(operation)) return 'warning';
    if (adminOps.includes(operation)) return 'error';
    return 'default';
  };

  const getResourceTypeColor = (type: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'default'> = {
      topic: 'primary',
      group: 'secondary',
      cluster: 'success',
      transactionalId: 'default',
    };
    return colors[type] || 'default';
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Resource</TableCell>
            <TableCell>Pattern</TableCell>
            <TableCell>Operations</TableCell>
            <TableCell>Host</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {acls.map((acl, index) => (
            <TableRow key={index}>
              <TableCell>
                <Chip
                  label={acl.type || 'allow'}
                  color={acl.type === 'deny' ? 'error' : 'success'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Chip
                    label={acl.resource.type}
                    color={getResourceTypeColor(acl.resource.type)}
                    size="small"
                    variant="outlined"
                  />
                  {acl.resource.name && (
                    <Typography variant="caption" color="text.secondary">
                      {acl.resource.name}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                {acl.resource.patternType && (
                  <Chip
                    label={acl.resource.patternType}
                    size="small"
                    variant="outlined"
                  />
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {acl.operations.map((op, opIndex) => (
                    <Chip
                      key={opIndex}
                      label={op}
                      color={getOperationColor(op)}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {acl.host || '*'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
