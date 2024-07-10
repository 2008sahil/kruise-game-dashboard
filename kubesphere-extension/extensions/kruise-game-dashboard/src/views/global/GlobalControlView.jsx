import React, {useEffect} from 'react';
import styled from 'styled-components';
import {Outlet, useLocation, useNavigate, useParams} from 'react-router-dom';
import {Icon, NavMenu, NavTitle} from '@ks-console/shared';
import {Group} from '@kubed/icons';
import {Banner, Col, CssBaseline, KubedConfigProvider, Row} from '@kubed/components';
import { LocaleProvider } from "@kube-design/components";
import locales from "../../locales";

window.locale = LocaleProvider.locale;

const PageSide = styled.div`
  position: fixed;
  top: 88px;
  padding: 0 20px 40px;
  width: 260px;
  z-index: 99;
`;

const PageMain = styled.div`
  margin-left: 240px;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
`;

export default function GlobalControlView() {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();

    let prefix = '/kruise-game-dashboard';

    const navs = [
        {
            name: 'kruise-game-dashboard',
            children: [
                {
                    name: 'overview',
                    icon: 'human',
                    title: 'Overview',
                },
                {
                    name: 'configuration',
                    icon: 'human',
                    title: 'Configuration',
                },
                {
                    name: 'projects',
                    icon: 'bird',
                    title: 'Projects',
                },
                {
                    name: 'deployunits',
                    icon: 'bird',
                    title: 'DeployUnits',
                }
            ],
        },
    ];
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    useEffect(() => {
        // add default location redirect to overview
        if (location.pathname === prefix) {
            navigate(location.pathname + '/overview', {replace: true});
        }
    }, []);

    return (
        <>
        <LocaleProvider locales={locales} currentLocale={getCookie("lang")} >
            <KubedConfigProvider>
                <CssBaseline/>
                <PageSide>
                    <NavTitle
                        icon={<Group variant="light" size={40}/>}
                        title={t('kruise-game-dashboard')}
                        style={{marginBottom: '20px'}}
                    />
                    <NavMenu navs={navs} pathname={location.pathname} prefix={prefix}/>
                </PageSide>
                <PageMain>
                    <Outlet/>
                </PageMain>
            </KubedConfigProvider>
        </LocaleProvider>
        </>
    );
}
