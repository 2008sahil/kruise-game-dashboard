package main

import (
    "context"
    "flag"
    "fmt"
    "os"

    "k8s.io/client-go/dynamic"
    "k8s.io/apimachinery/pkg/runtime/schema"

    "k8s.io/client-go/kubernetes"
    "k8s.io/client-go/tools/clientcmd"
    metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func main() {
    // Define and parse the kubeconfig flag
    kubeconfig := flag.String("kubeconfig", "C:/Users/shoot/KUBECONFIGfile.yaml", "location of kubeconfig file")
    gameServerSetName := flag.String("gameserverset-name", "", "name of the GameServerSet to filter")
    flag.Parse()

    // Check if the kubeconfig flag is being parsed correctly
    fmt.Printf("Using kubeconfig file: %s\n", *kubeconfig)

    // Build the Kubernetes client configuration from kubeconfig file
    config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
    if err != nil {
        fmt.Printf("Error building kubeconfig: %v\n", err)
        os.Exit(1)
    }

    // Create the Kubernetes clientset
    clientset, err := kubernetes.NewForConfig(config)
    if err != nil {
        fmt.Printf("Error creating clientset: %v\n", err)
        os.Exit(1)
    }

    // Create the dynamic client
    dynamicClient, err := dynamic.NewForConfig(config)
    if err != nil {
        fmt.Printf("Error creating dynamic client: %v\n", err)
        os.Exit(1)
    }

    // List pods in the "default" namespace
    pods, err := clientset.CoreV1().Pods("default").List(context.Background(), metav1.ListOptions{})
    if err != nil {
        fmt.Printf("Error listing pods: %v\n", err)
        os.Exit(1)
    }

    namespaces, err := clientset.CoreV1().Namespaces().List(context.Background(), metav1.ListOptions{})
    if err != nil {
        fmt.Printf("Error listing namespaces: %v\n", err)
        os.Exit(1)
    }

    // Print "hello" to indicate the program is running
    fmt.Println("hello")

    // Print the list of pods
    fmt.Println("Pods:")
    for _, pod := range pods.Items {
        fmt.Printf(" - %s\n", pod.Name)
    }


    // Print the list of namespaces
    fmt.Println("Namespaces:")
    for _, namespace := range namespaces.Items {
        fmt.Printf(" - %s\n", namespace.Name)
    }



    // Define the GVR (GroupVersionResource) for the custom resource
    gvr := schema.GroupVersionResource{
        Group:    "game.kruise.io",
        Version:  "v1alpha1",
        Resource: "gameserversets",
    }

    // Get the GameServerSet in the default namespace
    // namespace := "default"
    // name := "minecraft"
    // gameServerSets, err := dynamicClient.Resource(gvr).Namespace(namespace).List(context.Background(), metav1.ListOptions{})
    // if err != nil {
    //     fmt.Printf("Error getting GameServerSet: %v\n", err)
    //     os.Exit(1)
    // }

    // List all GameServerSets in the default namespace
    // namespace := "default"
    // gameServerSets, err := dynamicClient.Resource(gvr).Namespace(namespace).List(context.Background(), metav1.ListOptions{})
    // if err != nil {
    //     fmt.Printf("Error listing GameServerSets: %v\n", err)
    //     os.Exit(1)
    // }

    // // Print the GameServerSet
    // // Print the names of all GameServerSets
    // fmt.Println("GameServerSet Names:")
    // for _, gameServerSet := range gameServerSets.Items {
    //     fmt.Printf(" - %s\n", gameServerSet.GetName())
    // }

    // List all GameServerSets in the default namespace
    // gameServerSetName := flag.String("gameserverset-name", "", "name of the GameServerSet to filter")
    namespace := "default"
    listOptions := metav1.ListOptions{}
    if *gameServerSetName != "" {
        listOptions.FieldSelector = fmt.Sprintf("metadata.name=%s", *gameServerSetName)
    }

    gameServerSets, err := dynamicClient.Resource(gvr).Namespace(namespace).List(context.Background(), listOptions)
    if err != nil {
        fmt.Printf("Error listing GameServerSets: %v\n", err)
        os.Exit(1)
    }

    // Print the names of all GameServerSets
    fmt.Println("GameServerSet Names:")
    for _, gameServerSet := range gameServerSets.Items {
        fmt.Printf(" - %s\n", gameServerSet.GetName())
    }
}
