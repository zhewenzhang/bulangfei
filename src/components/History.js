import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material';

// --- Mock Data ---
// In a real application, you would fetch this data from your database.
const createData = (id, name, target, actual, serviceDuration) => {
  return { id, name, target, actual, serviceDuration };
};

const mockRows = [
  createData(1, 'MacBook Pro 14', 2.50, 3.10, 80),
  createData(2, 'iPhone 15 Pro', 1.80, 1.50, 120),
  createData(3, 'Sony WH-1000XM5', 0.50, 0.75, 45),
  createData(4, 'Kindle Paperwhite', 0.20, 0.15, 200),
];
// --------------------

// This is a placeholder for where you would fetch data.
const fetchRecords = async () => {
  console.log("Fetching records...");
  // Placeholder for SQL database interface call
  // const data = await api.getCalculations();
  // return data;
  return new Promise(resolve => setTimeout(() => resolve(mockRows), 500)); // Simulate network delay
};


// Stable sort utility
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
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}


const headCells = [
  { id: 'name', numeric: false, label: '名称 (Name)' },
  { id: 'target', numeric: true, label: '目标 (Target)' },
  { id: 'actual', numeric: true, label: '实际 (Actual)' },
  { id: 'serviceDuration', numeric: true, label: '服役程度 (Days)' },
];

const History = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // Fetch data when component mounts
    fetchRecords().then(data => {
      setRows(data);
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
    <Box sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
        <Typography variant="h4" gutterBottom>
            计算历史 (History)
        </Typography>
        <Paper sx={{ width: '100%', mb: 2 }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
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
                        {sortedRows.map((row) => (
                            <TableRow hover key={row.id}>
                                <TableCell component="th" scope="row">{row.name}</TableCell>
                                <TableCell align="right">¥{row.target.toFixed(2)}</TableCell>
                                <TableCell align="right">¥{row.actual.toFixed(2)}</TableCell>
                                <TableCell align="right">{row.serviceDuration}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    </Box>
  );
};

export default History;
