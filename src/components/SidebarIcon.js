import { makeStyles } from '@material-ui/core'

const iconSize = 120

const useStyles = makeStyles(theme => ({
  wrapper: {
    width: '20vh',
    maxWidth: iconSize,
    height: '20vh',
    maxHeight: iconSize,
    backgroundColor: '#F2F2F2',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 20,
    cursor: 'pointer'
  }
}))

const SidebarIcon = (props) => {
  const { name, onClick } = props
  const classes = useStyles()

  return (
    <div className={classes.wrapper} onClick={onClick}>
      {name}
    </div>
  )
}

export default SidebarIcon
