import React, { useState } from 'react'
import { Modal, Input, Text, Container, Button } from '@kubed/components'
import { Error } from '@kubed/icons'
import axios from 'axios';


export const DeleteModal = ({ visible, onCancel, onOk, resources,setvisible,loading }) => {

  const [inputValue, setInputValue] = useState("");
  const resourceNames = resources.map(resource => resource.Name);

  const fetchGameServerSets = async () => {
    const fetchClusterData = async (gss,clusterId,ns) => {
      try {
        await axios.delete(`/clusters/${clusterId}/apis/game.kruise.io/v1alpha1/namespaces/${ns}/gameserversets/${gss}`)        
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
    onOk("Deleted");
  };

  const title = (
    <div style={{ display: 'flex', justifyContent: 'center', gap: "5px" }}>
      <Error />
      <Text>{resources.length > 1 ? "Delete Multiple Resources" : "Delete Resource"}</Text>
    </div>
  )

  const message = `Enter the pod names ${resourceNames.join(', ')} to confirm that you understand the risks of this operation.`;

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
  };
  
  const footer = (
    <div>
      <Button variant="filled" color="default" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="filled" color="error" disabled={`${resourceNames.join(', ')}`===inputValue?false:true} onClick={handleClick}>
        OK
      </Button>
    </div>
  )
  
  return (
    <div>
      <Modal
        visible={visible}
        onCancel={onCancel}
        onOk={handleClick}
        title={title}
        width={500}
        closable={false}
        footer={footer}
      >
        <Container style={{ margin: "10px" }}>
          <div>
            <Text>
              {message}
            </Text>
          </div>
          <div style={{ marginTop: "10px" }}>
            <Input placeholder={`${resourceNames.join(', ')}`} value={inputValue} onChange={handleChange} />
          </div>
        </Container>
      </Modal>
    </div>
  )
}
