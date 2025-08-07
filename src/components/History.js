import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Typography,
} from '@mui/material';

async function fetchRecords() {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
  return data;
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

const headCells = [
  { id: 'name', numeric: false, label: '名称 (Name)' },
  { id: 'target', numeric: true, label: '目标 (Target)' },
  { id: 'actual', numeric: true, label: '实际 (Actual)' },
  { id: 'service_duration', numeric: true, label: '服役 (Days)' },
];

const History = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchRecords()
      .then(data => {
        setRows(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setRows([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRows = useMemo(() =>
    stableSort(rows, getComparator(order, orderBy)),
    [rows, order, orderBy]
  );

  return (
    <Card>
      <CardHeader title="计算历史" subheader="Calculation History" />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { backgroundColor: 'action.hover' } }}>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id)}
                  >
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center" sx={{ py: 4 }}>
                  <Typography color="error">Failed to load data: {error}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell component="th" scope="row">{row.name}</TableCell>
                  <TableCell align="right">¥{Number(row.target).toFixed(2)}</TableCell>
                  <TableCell align="right">¥{Number(row.actual).toFixed(2)}</TableCell>
                  <TableCell align="right">{row.service_duration}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default History;
