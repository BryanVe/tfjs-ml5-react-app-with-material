import React from 'react'
import {
  Drawer,
  Fab,
  makeStyles
} from '@material-ui/core'
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';

import { SidebarIcon } from 'components'

const sidebarWidth = 200

const useStyles = makeStyles(theme => ({
  sidebar: {
    width: sidebarWidth,
    backgroundColor: theme.palette.secondary.main,
    height: '100%',
    paddingTop: '18vh',
    paddingBottom: '18vh',
    display: 'flex',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  sidebarFab: {
    position: 'absolute',
    left: 20,
    bottom: 20
  },
  content: {
    width: '100vw',
    height: '100vh'
  }
}))

const GeneralLayout = (props) => {
  const { children, views } = props
  const classes = useStyles()
  const [openSidebar, setOpenSidebar] = React.useState(false)

  const handleOnOpenSidebar = () => setOpenSidebar(true)
  const handleOnCloseSidebar = () => setOpenSidebar(false)

  return (
    <>
      <div className={classes.content}>
        {children}
      </div>
      <Fab className={classes.sidebarFab} color='primary' aria-label='menu' onClick={handleOnOpenSidebar}>
        <MenuRoundedIcon />
      </Fab>
      <Drawer
        anchor='right'
        variant='temporary'
        open={openSidebar}
        onClose={handleOnCloseSidebar}
      >
        <div className={classes.sidebar}>
          {views.map(view => <SidebarIcon key={view.iconName} name={view.iconName} onClick={view.onIconClick} />)}
        </div>
      </Drawer>
    </>
  )
}

export default GeneralLayout
