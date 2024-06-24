import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, Pagination, Select } from "@kube-design/components";

function DeployUnitList(props) {
  const [config, setConfig] = useState(null);
  const [deployUnitsData, setDeployUnitsData] = useState([]);
  const [allDeployUnitsData, setAllDeployUnitsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 5 });


  let AllDeployUnitsData = [{"index":1,DeployUnit:"Project-A",gameServerSetCount:2,gameServerCount:3,projects:["sahil ,","gupta ,","kamina ,","kutta","harami"]},{"index":2,DeployUnit:"Project-A",gameServerSetCount:4,gameServerCount:7,projects:["sahil","gupta","kamina","kutta","harami"]},{"index":3,DeployUnit:"Project-A",gameServerSetCount:6,gameServerCount:4,projects:["sahil","gupta","kamina","kutta","harami"]},{"index":4,DeployUnit:"Project-A",gameServerSetCount:10,gameServerCount:1,projects:["sahil","gupta","kamina","kutta","harami"]},{"index":5,DeployUnit:"Project-A",gameServerSetCount:11,gameServerCount:5,projects:["sahil","gupta","kamina","kutta","harami"]},{"index":6,DeployUnit:"Project-A",gameServerSetCount:7,gameServerCount:7,projects:["sahil","gupta","kamina","kutta","harami"]},{"index":7,DeployUnit:"Project-A",gameServerSetCount:15,gameServerCount:12,projects:["sahil","gupta","kamina","kutta","harami"]}];

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('clusters/host/api/v1/namespaces/default/configmaps/configset');
        setConfig(response.data);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching config:', error);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchDeployUnitsData = async () => {
      if (!config) return;
      const projectLabelKey = config.Projectlabel;
      const deployUnits = JSON.parse(config.deployunits);
      const fetchPromises = deployUnits.map(clusterId => fetchClusterData(clusterId, projectLabelKey));

      try {
        const results = await Promise.all(fetchPromises);
        const allData = results.filter(data => data); // Filter out any undefined values
        setAllDeployUnitsData(allData);
        // setAllDeployUnitsData(AllDeployUnitsData)
        
        setDeployUnitsData(allData.slice(0, pagination.limit));
        // setDeployUnitsData(AllDeployUnitsData.slice(0, pagination.limit));
        setPagination(prevState => ({
          ...prevState,
          total: allData.length,
        }));
      } catch (error) {
        console.error('Error fetching deploy units data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeployUnitsData();
  }, [config]);

  const fetchClusterData = async (clusterId, projectLabelKey) => {
    try {
      const gameServerSetsResponse = await axios.get(`/clusters/${clusterId}/apis/game.kruise.io/v1alpha1/gameserversets`);
      const gameServerSets = gameServerSetsResponse.items;
      let gameServerSetCount = 0;
      let gameServerCount = 0;
      const projects = [];

      gameServerSets.forEach(gss => {
        if (gss.metadata.labels && gss.metadata.labels[projectLabelKey]) {
          const projectName = gss.metadata.labels[projectLabelKey];
          if (!projects.includes(projectName)) {
            projects.push(projectName);
          }
          gameServerCount += gss.spec.replicas;
          gameServerSetCount++;
        }
      });

      return {
        DeployUnit: clusterId,
        gameServerSetCount,
        gameServerCount,
        projects: projects.join(', '),
      };
    } catch (error) {
      console.error(`Error fetching data for cluster ${clusterId}:`, error);
      return null;
    }
  };

  const handleTableChange = (e,Sorter ) => {
    const sortedData = sortData(allDeployUnitsData, Sorter.field, Sorter.order);
    setAllDeployUnitsData(sortedData)
    setDeployUnitsData(sortedData.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit));
  };

  const sortData = (data, field, order) => {
    if (!field || !order) return data;
    const sortedData = [...data].sort((a, b) => {
      if (a[field] < b[field]) return order === 'ascend' ? -1 : 1;
      if (a[field] > b[field]) return order === 'ascend' ? 1 : -1;
      return 0;
    });
    return sortedData;
  };

  const options = [
    { value: 5, label: 5 },
    { value: 10, label: 10 },
    { value: 50, label: 50 }
  ];

  const handleLimitChange = (limit) => {
    setPagination(prevState => ({
      ...prevState,
      limit: limit,
      page: 1,
    }));
    // const sortedData = sortData(allDeployUnitsData, sorter.field, sorter.order);
    setDeployUnitsData(allDeployUnitsData.slice(0, limit));
  };

  const handlePageChange = (page) => {
    setPagination(prevState => ({
      ...prevState,
      page: page,
    }));
    // const sortedData = sortData(allDeployUnitsData, sorter.field, sorter.order);
    setDeployUnitsData(allDeployUnitsData.slice((page - 1) * pagination.limit, page * pagination.limit));
  };

  const columns = [
    {
      title: 'DeployUnit',
      dataIndex: 'DeployUnit',
      render: (value) => <Link to={`/clusters/${value}/kruise-game-dashboard`}>{value}</Link>,
    },
    {
      title: 'gameServerSetCount',
      dataIndex: 'gameServerSetCount',
      sorter: true,
    },
    {
      title: 'gameServerCount',
      dataIndex: 'gameServerCount',
      sorter: true,
    },
    {
      title: 'Projects',
      dataIndex: 'projects',
      render: (projects) => projects || 'No projects',
    },
  ];

  const footer = (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Pagination {...pagination} onChange={handlePageChange} />
      <div>
        <p>Total: {pagination.total}</p>
        <Select
          name="select"
          style={{ width: "60px" }}
          options={options}
          onChange={handleLimitChange}
          defaultValue={5}
        />
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "white", borderRadius: "15px", padding: "10px" }}>
      <Table
        rowKey="DeployUnit"
        columns={columns}
        dataSource={deployUnitsData}
        loading={isLoading}
        pagination={pagination}
        onChange={handleTableChange}
        footer={footer}
      />
    </div>
  );
}

export default DeployUnitList;
