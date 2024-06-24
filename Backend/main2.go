package main

import (
    "context"
    "encoding/json"
    "flag"
    "fmt"
    "net/http"
    "os"

    "k8s.io/apimachinery/pkg/runtime/schema"
    "k8s.io/client-go/dynamic"
    "k8s.io/client-go/kubernetes"
    "k8s.io/client-go/tools/clientcmd"
    metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

var clientset *kubernetes.Clientset
var dynamicClient dynamic.Interface

func main() {
    // Define and parse the kubeconfig flag
    kubeconfig := flag.String("kubeconfig", "C:/Users/shoot/KUBECONFIGfile.yaml", "location of kubeconfig file")
    flag.Parse()

    // Build the Kubernetes client configuration from kubeconfig file
    config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
    if err != nil {
        fmt.Printf("Error building kubeconfig: %v\n", err)
        os.Exit(1)
    }

    // Create the Kubernetes clientset
    clientset, err = kubernetes.NewForConfig(config)
    if err != nil {
        fmt.Printf("Error creating clientset: %v\n", err)
        os.Exit(1)
    }

    // Create the dynamic client
    dynamicClient, err = dynamic.NewForConfig(config)
    if err != nil {
        fmt.Printf("Error creating dynamic client: %v\n", err)
        os.Exit(1)
    }

    // Define HTTP handlers
    http.HandleFunc("/api/ns", listNamespacesHandler)
    http.HandleFunc("/api/gameserversets", listGameServerSetsHandler)

    // Start the HTTP server
    fmt.Println("Starting server on :8080")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        fmt.Printf("Error starting server: %v\n", err)
    }
}

// Handler to list namespaces
func listNamespacesHandler(w http.ResponseWriter, r *http.Request) {
    namespaces, err := clientset.CoreV1().Namespaces().List(context.Background(), metav1.ListOptions{})
    if err != nil {
        http.Error(w, fmt.Sprintf("Error listing namespaces: %v", err), http.StatusInternalServerError)
        return
    }

    jsonResponse(w, namespaces.Items)
}

// Handler to list GameServerSets
func listGameServerSetsHandler(w http.ResponseWriter, r *http.Request) {
    gvr := schema.GroupVersionResource{
        Group:    "game.kruise.io",
        Version:  "v1alpha1",
        Resource: "gameserversets",
    }

    namespace := "default" // Adjust if needed
    gameServerSets, err := dynamicClient.Resource(gvr).Namespace(namespace).List(context.Background(), metav1.ListOptions{})
    if err != nil {
        http.Error(w, fmt.Sprintf("Error listing GameServerSets: %v", err), http.StatusInternalServerError)
        return
    }

    jsonResponse(w, gameServerSets.Items)
}

// Utility function to write JSON response
func jsonResponse(w http.ResponseWriter, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(data); err != nil {
        http.Error(w, fmt.Sprintf("Error encoding response: %v", err), http.StatusInternalServerError)
    }
}
