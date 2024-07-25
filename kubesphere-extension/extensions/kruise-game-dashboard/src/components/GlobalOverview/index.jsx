import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Badge, Banner, Col, Entity, Field, Row,} from '@kubed/components';
import {Icon} from "@ks-console/shared";
// import './index.css'

function GlobalOverview(props) {
    let params = useParams();
    let clusterId = params.name;
    const [gameServerSets, setGameServerSets] = useState([]);
    const [gameServers, setGameServers] = useState([]);


    // load data from apiServer and set to state
    useEffect(() => {
        axios.get('/clusters/' + 'host' + '/apis/game.kruise.io/v1alpha1/gameserversets')
            .then(response => {
                setGameServerSets(response.items)
            });
        axios.get('/clusters/' + 'host' + '/apis/game.kruise.io/v1alpha1/gameservers')
            .then(response => {
                if (response.items === undefined) {
                    setGameServers(response.data.items)
                } else {
                    setGameServers(response.items)
                }
            });
    }, []);

    let gsCreating = 0;
    let gsUpdating = 0;
    let gsDeleting = 0;
    let gsReady = 0;
    let gsNotReady = 0;
    let gsNetwork = 0;
    let gsNetworkReady = 0;
    let gsNone = 0;
    let gsAllocated = 0;
    let gsWaitToBeDeleted = 0;
    let gsMaintaining = 0;

    for (let i = 0; i < gameServers.length; i++) {
        if (gameServers[i].status.currentState === "Creating") {
            gsCreating = gsCreating + 1;
        }
        if (gameServers[i].status.currentState === "Updating") {
            gsUpdating = gsUpdating + 1;
        }
        if (gameServers[i].status.currentState === "Deleting") {
            gsDeleting = gsDeleting + 1;
        }
        if (gameServers[i].status.currentState === "Ready") {
            gsReady = gsReady + 1;
        }
        if (gameServers[i].status.currentState === "NotReady") {
            gsNotReady = gsNotReady + 1;
        }
        if (gameServers[i].status.networkStatus.networkType !== undefined) {
            gsNetwork = gsNetwork + 1;
        }
        if (gameServers[i].status.networkStatus.currentNetworkState === "Ready") {
            gsNetworkReady = gsNetworkReady + 1;
        }
        if (gameServers[i].spec.opsState === "None") {
            gsNone = gsNone + 1;
        }
        if (gameServers[i].spec.opsState === "Allocated") {
            gsAllocated = gsAllocated + 1;
        }
        if (gameServers[i].spec.opsState === "Maintaining") {
            gsMaintaining = gsMaintaining + 1;
        }
        if (gameServers[i].spec.opsState === "WaitToBeDeleted") {
            gsWaitToBeDeleted = gsWaitToBeDeleted + 1;
        }
    }

    return (
        <>
         <div style={{padding:"20px",color:"#333"}} className="global-overview">
      <h1 style={{textAlign:"center"}}>Global Overview</h1>
      <section style={{marginBottom:"20px"}} className="intro">
        <h2 style={{borderBottom:"2px solid #0056b3",paddingBottom:"5px",color:"#0056b3"}}>Welcome to the OKG Dashboard</h2>
        <p>
          Welcome to the OpenKruiseGame (OKG) Dashboard, your centralized hub for managing game server deployments across multiple Kubernetes clusters. OKG is designed to simplify, accelerate, and enhance the cloud-native transformation of game servers. As a sub-project of the OpenKruise initiative under the Cloud Native Computing Foundation (CNCF), OKG integrates seamlessly with Kubernetes to provide robust solutions tailored to the unique demands of game server operations.
        </p>
      </section>

      <section style={{marginBottom:"20px"}} className="about">
        <h2 style={{borderBottom:"2px solid #0056b3",paddingBottom:"5px",color:"#0056b3"}}>About OpenKruiseGame (OKG)</h2>
        <p>
          OpenKruiseGame is a custom Kubernetes workload optimized for game server scenarios. It extends Kubernetes capabilities to handle the specific needs of game servers, offering features such as:
        </p>
        <ul style={{listStyleType:"disc",paddingLeft:"20px"}}>
          <li style={{marginBottom:"10px"}}><strong>Hot Updates and Reloads:</strong> Minimize disruptions with seamless updates without recreating pods.</li>
          <li style={{marginBottom:"10px"}} ><strong>Game Server Management:</strong> Specialized operations for stateful game servers, allowing control over specific game server instances.</li>
          <li style={{marginBottom:"10px"}}><strong>Advanced Networking:</strong> Support for network configurations suitable for game servers, including fixed IPs, lossless connections, and global acceleration.</li>
          <li style={{marginBottom:"10px"}}><strong>Comprehensive Orchestration:</strong> Simplified orchestration of complex game server architectures, integrating various server types such as gateways, game engines, and policy servers.</li>
        </ul>
      </section>

      <section style={{marginBottom:"20px"}} className="features">
        <h2 style={{borderBottom:"2px solid #0056b3",paddingBottom:"5px",color:"#0056b3"}}>Key Features of OKG</h2>
        <ul  style={{listStyleType:"disc",paddingLeft:"20px"}}>
          <li style={{marginBottom:"10px"}}><strong>Hot Updates and Reloads:</strong> Facilitates live updates of game server configurations and code without downtime.</li>
          <li style={{marginBottom:"10px"}}><strong>Game Server Isolation:</strong> Manage and update game servers individually, ensuring that active players are not affected during maintenance.</li>
          <li style={{marginBottom:"10px"}}><strong>Flexible Networking:</strong> Choose from multiple network models designed for gaming, ensuring high performance and low latency.</li>
          <li style={{marginBottom:"10px"}}><strong>Automated Scaling and Management:</strong> Automatically scale game servers based on demand and maintain service quality with built-in automation.</li>
          <li style={{marginBottom:"10px"}}><strong>Multi-Cloud Support:</strong> Deploy and manage game servers across different cloud providers with consistency and ease.</li>
          <li style={{marginBottom:"10px"}}><strong>Zero-Code Integration:</strong> Leverage low-code or no-code solutions to integrate essential features like logging, monitoring, and matchmaking.</li>
        </ul>
      </section>

      <section  style={{marginBottom:"20px"}} className="core-components">
        <h2 style={{borderBottom:"2px solid #0056b3",paddingBottom:"5px",color:"#0056b3"}}>Core Components of the OKG Dashboard</h2>
        <p>
          The OKG Dashboard includes several core components to streamline game server management:
        </p>
        <ul style={{listStyleType:"disc",paddingLeft:"20px"}}>
          <li style={{marginBottom:"10px"}}><strong>DeployUnits:</strong> Kubernetes clusters designated for deploying GameServers. Configure and manage clusters to streamline game server deployments.</li>
          <li style={{marginBottom:"10px"}}><strong>Projects:</strong> Organize your game server deployments into projects. Each project encompasses multiple GameServerSets, making it easier to manage and monitor your game server fleet.</li>
          <li style={{marginBottom:"10px"}}><strong>GameServerSets:</strong> Define and manage groups of game servers within projects. Each set can be deployed across various DeployUnits.</li>
          <li style={{marginBottom:"10px"}}><strong>GameServers:</strong> Individual instances of game servers running within your clusters. Manage their configurations, scaling, and operations seamlessly.</li>
        </ul>
      </section>

      <section className="why-okg">
        <h2>Why Choose OpenKruiseGame?</h2>
        <p>
          Kubernetes provides a robust foundation for cloud-native applications, but game servers have unique needs that often go beyond standard Kubernetes features. OpenKruiseGame addresses these challenges by providing:
        </p>
        <ul>
          <li><strong>Enhanced Game Server Management:</strong> Simplifies the lifecycle management of game servers with features specifically designed for gaming workloads.</li>
          <li><strong>Scalability and Performance:</strong> Ensures high availability and performance through advanced scaling and networking features.</li>
          <li><strong>Customizable and Extensible:</strong> Fully open-source and customizable, allowing developers to tailor workloads and integrate with various tools and platforms.</li>
        </ul>
      </section>

      <section className="dashboard-pages">
        <h2>Overview of Dashboard Pages</h2>
        <p>
          The OKG Dashboard is designed to provide a comprehensive view and management interface for all aspects of your game server deployments. Here’s a quick overview of the key pages:
        </p>
        <ul>
          <li><strong>Overview Page:</strong> Provides a high-level summary of all projects, DeployUnits, GameServerSets, and GameServers. It offers quick access to essential metrics and status indicators.</li>
          <li><strong>Project Page:</strong> Displays detailed information about each game project, including a list of GameServerSets and GameServers within the project. Users can navigate to specific project details and perform actions like updating configurations and scaling servers.</li>
          <li><strong>Configuration Page:</strong> Allows users to manage global settings for the OKG Dashboard, such as project label keys and DeployUnits list. This page ensures that the dashboard is properly configured to reflect the current deployment environment.</li>
          <li><strong>DeployUnits Page:</strong> Lists all clusters designated as DeployUnits. Users can view details about each DeployUnit, including the number of GameServerSets and GameServers deployed.</li>
          <li><strong>GameServerSet Table Page:</strong> Shows all GameServerSets within a selected project. Includes functionality to filter, search, and manage GameServerSets, such as updating container images and configuring scaling policies.</li>
          <li><strong>GameServer Table Page:</strong> Lists all GameServers within a project. Users can perform various operations such as updating container configurations, restarting servers, and managing game server priorities.</li>
        </ul>
      </section>
    </div>
            {/* <Row columns={20}>
                <Col span={16}>
                    <Banner
                        icon={<Icon name="application" size={20}/>}
                        title={t("global_overview")}
                        description={t("gameservers_description")}
                    />
                </Col>
            </Row>

            <Row columns={20}>
                <Col span={16} style={{ background: 'white', borderRadius: '5px'}}>
                    <Row columns={16}>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="default"></Badge>
                                <Field label={t("num_total")} value={gameServers.length} style={{fontSize: 'larger', fontWeight: 'bold'}} />
                            </Entity>
                        </Col>
                        <Col span={4} >
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="warning"></Badge>
                                <Field label={t("num_creating")} value={gsCreating} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="warning"></Badge>
                                <Field label={t("num_updating")} value={gsUpdating} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="error"></Badge>
                                <Field label={t("num_deleting")} value={gsDeleting} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                    </Row>

                    <Row columns={16}>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="success"></Badge>
                                <Field label={t("num_ready")} value={gsReady} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="warning"></Badge>
                                <Field label={t("num_notReady")} value={gsNotReady} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="default"></Badge>
                                <Field label={t("num_network")} value={gsNetwork} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="success"></Badge>
                                <Field label={t("num_network_ready")} value={gsNetworkReady} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                    </Row>

                    <Row columns={16}>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="default"></Badge>
                                <Field label={t("num_none")} value={gsNone} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="warning"></Badge>
                                <Field label={t("num_allocated")} value={gsAllocated} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="warning"></Badge>
                                <Field label={t("num_waitToBeDeleted")} value={gsWaitToBeDeleted} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                        <Col span={4}>
                            <Entity bordered={false} style={{ background: 'white', borderRadius: '10px'}}>
                                <Badge color="error"></Badge>
                                <Field  label={t("num_maintaining")} value={gsMaintaining} style={{fontSize: 'larger', fontWeight: 'bold'}}/>
                            </Entity>
                        </Col>
                    </Row>
                </Col>
            </Row> */}
        </>
    )


}

export default GlobalOverview;
