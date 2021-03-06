import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { AdminPanel } from 'pages/adminPanel';
import { Login } from 'pages/login';
import { UserIndex } from 'pages/users';
import { ChangePass } from 'pages/changePass';
import { ErrorPage } from 'pages/error';
import { useOnlineStatus } from 'hooks/useOnlineStatus';
import { me } from 'services/api/user';
import { MHeader } from 'layouts/header';
import {
  releaseAxiosInterceptors,
  setUpAxiosInterceptors,
} from './services/axios';
import {
  AnimatedRoutes,
  RouteTransition,
  RouteWithoutTransition,
} from './components/routeTransition';

const { Content } = Layout;

export function App() {
  const location = useLocation();
  const history = useHistory();
  const [online] = useOnlineStatus();

  useEffect(() => {
    setUpAxiosInterceptors(history, location);
    return () => {
      releaseAxiosInterceptors();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const validate = async () => {
      try {
        await me();
      } catch (e) {
        if (e?.response?.data) {
          switch (e.response.data.statusCode) {
            case 401:
            case 403:
            default: {
              history.replace('/login', { login: true });
              break;
            }
          }
        }
      }
    };
    if (location.pathname !== '/login' && location.pathname !== '/error')
      validate();
  }, [history, location]);

  useEffect(() => {
    const { state } = location;
    if (state?.prevLocation) {
      history.replace({ pathname: state.prevLocation, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (online) {
      //Check if the client is online again
      if (location.pathname === '/error') {
        const prevLocation = location.state.prevLocation;
        if (prevLocation) {
          //If there is a prevLocation state, then replace to that location
          switch (prevLocation) {
            case '/error': {
              history.replace({
                pathname: '/',
                state: {},
              });
              break;
            }
            default: {
              history.replace({
                pathname: prevLocation,
                state: { prevLocation: location.pathname, conn: true },
              });
            }
          }
        } else {
          history.replace({
            pathname: '/',
            state: {},
          });
        }
      }
    } else {
      // If client goes offline then we redirect to error page
      history.replace({
        pathname: '/error',
        state: { prevLocation: location.pathname, conn: true },
      });
    }
  }, [online]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout className='min-h-screen max-h-screen overflow-hidden max-w-full'>
      <MHeader location={location} />
      <Content className='sm:h-full md:min-h-full overflow-auto flex'>
        <AnimatedRoutes exitBeforeEnter initial={true} location={location}>
          <RouteTransition exact path='/login' slideUp={15}>
            <Login />
          </RouteTransition>
          <RouteTransition exact path='/reset-psw' slideUp={15}>
            <ChangePass />
          </RouteTransition>
          <RouteWithoutTransition path='/users'>
            <UserIndex />
          </RouteWithoutTransition>
          <RouteTransition exact path='/'>
            <AdminPanel />
          </RouteTransition>
          {/* <RouteTransition exact path='/error' slideUp={15}>
            <ErrorPage />
          </RouteTransition> */}
          <RouteTransition path='/' slideUp={15}>
            <ErrorPage />
          </RouteTransition>
        </AnimatedRoutes>
      </Content>
    </Layout>
  );
}
