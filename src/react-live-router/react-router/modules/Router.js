import warning from 'warning'
import invariant from 'invariant'
import React from 'react'
import PropTypes from 'prop-types'
import { isStringTextContainingNode } from 'typescript'

/**
 * The public API for putting history on context.
 */
class Router extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    children: PropTypes.node
  }

  static contextTypes = {
    router: PropTypes.object
  }

  static childContextTypes = {
    router: PropTypes.object.isRequired,
    setGoingToFloatRoute: PropTypes.func.isRequired,
    isGoingToFloatRoute: PropTypes.bool.isRequired,
    setPrevContextAndMatch: PropTypes.func.isRequired,
    _backupRouter: PropTypes.object.isRequired
  }

  _backupRouter = {}

  getChildContext() {
    return {
      router: {
        ...this.context.router,
        history: this.props.history,
        route: {
          location: this.props.history.location,
          match: this.state.match
        }
      },
      setPrevContextAndMatch: router => {
        console.log('----fucking')
        this._backupRouter = router
      },
      setGoingToFloatRoute: is => {
        this.setState({
          isGoingToFloatRoute: true
        })
      },
      isGoingToFloatRoute: this.state.isGoingToFloatRoute,
      _backupRouter: this._backupRouter
    }
  }

  state = {
    match: this.computeMatch(this.props.history.location.pathname),
    isGoingToFloatRoute: false
  }

  computeMatch(pathname) {
    return {
      path: '/',
      url: '/',
      params: {},
      isExact: pathname === '/'
    }
  }

  componentWillMount() {
    const { children, history } = this.props

    invariant(children == null || React.Children.count(children) === 1, 'A <Router> may have only one child element')

    // Do this here so we can setState when a <Redirect> changes the
    // location in componentWillMount. This happens e.g. when doing
    // server rendering using a <StaticRouter>.
    this.unlisten = history.listen(() => {
      // console.log(history.location.pathname)
      this.setState({
        match: this.computeMatch(history.location.pathname)
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    warning(this.props.history === nextProps.history, 'You cannot change <Router history>')
  }

  componentWillUnmount() {
    this.unlisten()
  }

  render() {
    const { children } = this.props
    return children ? React.Children.only(children) : null
  }
}

export default Router
