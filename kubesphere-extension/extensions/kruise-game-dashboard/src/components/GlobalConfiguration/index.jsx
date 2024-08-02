import React, { useEffect, useState } from 'react';
import { Select, Button,Notify } from "@kube-design/components";
import { Text, Input, Container } from '@kubed/components';
import styled from 'styled-components';
import axios from "axios";

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 600px;
  margin-top: 20px; /* Add margin-top for spacing */
`;

const StyledSelect = styled(Select)`
  width: 600px;
  font-size: 1.5em; /* Make text larger */
`;

const StyledInput = styled(Input)`
  width: 600px;
  font-size: 1.2em; /* Make text larger */
`;

const StyledText = styled(Text)`
  font-size: 1.5em; /* Make text larger */
`;
const StyledOuterContainer = styled.div`
  margin-top: 50px;
`;

function GlobalConfiguration(props) {

  const [selectedValues, setSelectedValues] = useState([]);
  const [inputvalue, setinputvalue] = useState("");
  const [clusterOptions, setClusterOptions] = useState([]);
  const [config,setconfig]= useState(false)
  const [loading,setloading]=useState(false)

  const handleChange = (Value) => {
    setSelectedValues(Value);
  };

  const handleInputChange=(event)=>{
    setinputvalue(event.target.value)
  };

  const fetchClusters = async () => {
    try {
      const response = await axios.get('/kapis/tenant.kubesphere.io/v1alpha2/clusters');
      const clusterNames = response.items.map(cluster => ({
        value: cluster.metadata.name,
        label: cluster.metadata.name
      }));
      setClusterOptions(clusterNames);
    } catch (error) {
      console.error('Error fetching clusters:', error);
    }
  };
  const fetchConfig = async () => {
    setloading(true)
    try {
      const storedConfig = localStorage.getItem('config');
      if (storedConfig) {
        const configData = JSON.parse(storedConfig);
        setSelectedValues(JSON.parse(configData.deployUnits));
        setinputvalue(configData.projectLabel);
      } 
      else{
        const response = await axios.get('clusters/host/api/v1/namespaces/default/configmaps/configset');
        setSelectedValues(JSON.parse(response.data.deployUnits))
        setinputvalue(response.data.projectLabel)
        // Save config data to local storage
        const configData = {
          projectLabel: (response.data.projectLabel),
        deployUnits: (response.data.deployUnits)
        };
        localStorage.setItem('config', JSON.stringify(configData));
      }
      setconfig(true)
    } catch (error) {
    }
    setloading(false)
  };

  const handleClick=async ()=>{
    if(!inputvalue.trim()){
      return Notify.warning('Project label cannot be empty')
    }
    if(selectedValues.length === 0){
      return Notify.warning('Please select at least one Deploy Unit')
    }
    setloading(true)
    try{
      const configMap = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'configset',
          namespace: 'default', 
        },
        data: {
          'projectLabel': inputvalue, 
          'deployUnits': JSON.stringify(selectedValues) 
        },
      };
      if(config===true){
        await axios.put('/clusters/host/api/v1/namespaces/default/configmaps/configset', configMap)
         Notify.success('Dashboard Config Updated')
      }
      else{
        await axios.post('/clusters/host/api/v1/namespaces/default/configmaps', configMap)
        Notify.success('Dashboard Config Created')
      }
      // Save config data to local storage
      const configData = {
        projectLabel: inputvalue,
        deployUnits: JSON.stringify(selectedValues)
      };
      localStorage.setItem('config', JSON.stringify(configData));
    } catch (error) {
      console.error('Error creating ConfigMap:', error);
    }
    setloading(false)
  }

  useEffect(async ()=>{
    fetchClusters();
    fetchConfig();
},[])

  return (
    
    <StyledOuterContainer>
    <Container>
      <StyledText variant="h3">{t("Project Label Key")}</StyledText>
      <StyledInput value ={inputvalue} onChange={handleInputChange} placeholder="Select Project label" disabled={loading} />   
      <StyledText variant="h3">{t("Deploy Units")}</StyledText>
      <StyledSelect 
        name="select-multi" 
        options={clusterOptions} 
        onChange={handleChange} 
        multi 
        searchable
        value={selectedValues} 
        placeholder={('name')}
        disabled={loading}
      />
      <ButtonWrapper>
        <Button type="primary" loading={loading} onClick={handleClick}>{t("Save Config")}</Button>
      </ButtonWrapper>
    </Container>
    </StyledOuterContainer>
  );
}

export default GlobalConfiguration;
