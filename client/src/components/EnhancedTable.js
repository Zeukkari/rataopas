import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import FilterListIcon from '@material-ui/icons/FilterList'
import { lighten } from '@material-ui/core/styles/colorManipulator'

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map(el => el[0])
}

function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy)
}

class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property)
  }

  render() {
    const { order, orderBy, type } = this.props

    const typeLabel = type === 'DEPARTURE' ? 'Lähtee' : 'Saapuu'

    const rows = [
      {
        id: 'id',
        numeric: false,
        disablePadding: true,
        label: '',
      },
      {
        id: 'commuterLineID',
        numeric: false,
        disablePadding: false,
        label: 'Juna',
      },
      {
        id: 'startStation',
        numeric: false,
        disablePadding: false,
        label: 'Lähtöasema',
      },
      {
        id: 'endStation',
        numeric: false,
        disablePadding: false,
        label: 'Pääteasema',
      },
      {
        id: 'sortTime',
        numeric: false,
        disablePadding: false,
        label: typeLabel,
      },
    ]

    return (
      <TableHead>
        <TableRow>
          {rows.map(
            row => (
              <TableCell
                key={row.id}
                align={'right'}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title='Sort'
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ),
            this,
          )}
        </TableRow>
      </TableHead>
    )
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
}

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
})

let EnhancedTableToolbar = props => {
  const { numSelected, classes } = props

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          <Tooltip title='Delete'>
            <IconButton aria-label='Delete'>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title='Filter list'>
            <IconButton aria-label='Filter list'>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </Toolbar>
  )
}

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
}

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar)

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 240,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
})

class EnhancedTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      order: 'asc',
      orderBy: 'sortTime',
      selected: [],
      trains: props.trains,
      page: 0,
      rowsPerPage: 10,
    }
  }

  handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }

    this.setState(state => ({ ...state, order, orderBy }))
  }

  handleSelectAllClick = event => {
    if (event.target.checked) {
      this.setState(state => ({
        selected: state.trains.map(n => n.trainNumber),
        ...state,
      }))
      return
    }
    this.setState({ selected: [] })
  }

  handleClick = (event, id) => {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    this.setState({ selected: newSelected, ...this.state })
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value })
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

  render() {
    const { currentStation, type, classes } = this.props
    const { trains, order, orderBy, selected, rowsPerPage, page } = this.state
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, trains.length - page * rowsPerPage)

    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby='tableTitle'>
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={trains.length}
              type={type}
              currentStation={currentStation}
            />
            <TableBody>
              {stableSort(trains, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(train => {
                  const isSelected = this.isSelected(train.trainNumber)
                  let trainLabel
                  if (train.commuterLineID) {
                    trainLabel = `Commuter ${train.commuterLineID}`
                  } else {
                    trainLabel = `${train.trainType} ${train.trainNumber}`
                  }

                  const startStation = train.startStation
                  const endStation = train.endStation

                  let timeLabel
                  if (type === 'ARRIVAL') {
                    timeLabel = train.arrivalTime
                  } else {
                    timeLabel = train.departureTime
                  }

                  let rowColor = train.cancelled ? 'error' : 'textPrimary'

                  return (
                    <TableRow
                      hover
                      onClick={event =>
                        this.handleClick(event, train.trainNumber)
                      }
                      role='checkbox'
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={`${train.trainNumber}-${Math.random()}`}
                      selected={isSelected}
                      className={classes.row}
                    >
                      <TableCell padding='checkbox' />
                      <TableCell
                        component='th'
                        scope='row'
                        padding='none'
                        align='right'
                      >
                        <Typography>{trainLabel}</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography>{startStation}</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography>{endStation}</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography color={rowColor}>{timeLabel}</Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 50, 100]}
          component='div'
          count={trains.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    )
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(EnhancedTable)
