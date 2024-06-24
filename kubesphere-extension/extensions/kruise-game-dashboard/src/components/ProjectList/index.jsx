import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, Pagination, Select } from "@kube-design/components";

function Projects() {
  const [config, setConfig] = useState(null);
  const [projectsData, setProjectsData] = useState([]);
  const [allprojectData,setallprojectData]=useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 5 });

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
    const fetchProjectsData = async () => {
      if (!config) return;
      const projectLabelKey = config.Projectlabel;
      const deployUnits = JSON.parse(config.deployunits);
      let projects = {};

      for (let clusterId of deployUnits) {
        try {
          const response = await axios.get(`/clusters/${clusterId}/apis/game.kruise.io/v1alpha1/gameserversets`);
          const gameServerSets = response.items;

          gameServerSets.forEach(gss => {
            if (gss.metadata.labels && gss.metadata.labels[projectLabelKey]) {
              const projectName = gss.metadata.labels[projectLabelKey];
              if (!projects[projectName]) {
                projects[projectName] = {
                  projectName: projectName,
                  gameServerSetCount: 0,
                  gameServerCount: 0,
                  deployUnits: []
                };
              }
              projects[projectName].gameServerSetCount += 1;
              projects[projectName].gameServerCount += gss.spec.replicas;
              if (!projects[projectName].deployUnits.includes(clusterId)) {
                projects[projectName].deployUnits.push(clusterId);
              }
            }
          });
        } catch (error) {
          console.error(`Error fetching data for cluster ${clusterId}:`, error);
        }
      }

      const projectsArray = Object.values(projects);
      setallprojectData(projectsArray)
      setProjectsData(projectsArray.slice(0, pagination.limit));
        
      setPagination(prevState => ({
        ...prevState,
        total: projectsArray.length,
      }));
      setIsLoading(false);
    };

    fetchProjectsData();
  }, [config]);

  const handleTableChange = (filters, Sorter) => {
      const sortedData = sortData(allprojectData, Sorter.field, Sorter.order);
      setallprojectData(sortedData)
      setProjectsData(sortedData.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit))

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
    setProjectsData(allprojectData.slice(0, limit));
  };

  const handlePageChange = (page) => {
    setPagination(prevState => ({
      ...prevState,
      page: page,
    }));
    const newData = allprojectData.slice((page - 1) * pagination.limit, page * pagination.limit);
    setProjectsData(newData);
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      render: (value) => <Link to={`/kruise-game-dashboard/projects/${value}`}>{value}</Link>,
    },
    {
      title: 'Total GameServerSets',
      dataIndex: 'gameServerSetCount',
      sorter: true,
    },
    {
      title: 'Total GameServers',
      dataIndex: 'gameServerCount',
      sorter: true,
    },
    {
      title: 'Deploy Units',
      dataIndex: 'deployUnits',
      render: (deployUnits) => deployUnits.join(', '),
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
        rowKey="projectName"
        columns={columns}
        dataSource={projectsData}
        loading={isLoading}
        pagination={pagination}
        onChange={handleTableChange}
        footer={footer}
      />
    </div>
  );
}

export default Projects;
