import React, { useState } from 'react'
import { Modal, InputNumber, Text, Container, Button } from '@kubed/components'
import { Update } from '@kubed/icons'
import axios from 'axios';


export const UpdateReplicaModal = ({ visible, onCancel, onOk, resources,setvisible,loading }) => {
  const [inputValue, setInputValue] = useState(0);
  const resourceNames = resources.map(resource => resource.Name);

  const fetchGameServerSets = async () => {
    const fetchClusterData = async (gss,clusterId,ns) => {
      try {
        const patchData = {
          spec: {
            replicas:inputValue
          }
      };
        await axios.patch(`/clusters/${clusterId}/apis/game.kruise.io/v1alpha1/namespaces/${ns}/gameserversets/${gss}`,patchData,{ headers: { 'Content-Type': 'application/merge-patch+json' } })        
      } catch (error) {
        console.error(`Error fetching data for cluster ${clusterId}:`, error);       
      }
    };
    try {
      await Promise.all(resources.map(resource => fetchClusterData(resource.Name, resource.DeployUnit,resource.ns)));
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleClick = async() => {
    setvisible(false)
    loading(true)
    await fetchGameServerSets();
    setInputValue("")
    onOk("Updated");
  };

  const title = (
    <div style={{ display: 'flex', justifyContent: 'center', gap: "5px" }}>
      <Update />
      <Text>{"Update Resource Replicas"}</Text>
    </div>
  )
  
  const message = `Enter the Replicas of gamserverset ${resourceNames.join(', ')} to which you want to update.`;

  const handleChange = (value) => {
    setInputValue(value);
  };
  
  const footer = (
    <div>
      <Button variant="filled" color="default" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="filled" color="error" onClick={handleClick}>
        OK
      </Button>

    </div>
  )
  return (
    <div>
      <Modal
        visible={visible}
        title={title}
        width={500}
        closable={false}
        footer={footer}
      >
        <Container style={{ margin: "10px"}}>
          <div>
            <Text>
              {message}
            </Text>
          </div>
          <div style={{ marginTop: "10px" ,marginBottom:"5px"}}>
            <InputNumber width={400} value={inputValue} min={1} onChange={handleChange} step={1} />
           </div>
        </Container>
      </Modal>
    </div>
  )
}
