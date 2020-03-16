// Code generated by protoc-gen-micro. DO NOT EDIT.
// source: object.proto

/*
Package object is a generated protocol buffer package.

It is generated from these files:
	object.proto

It has these top-level messages:
	CleanResourcesRequest
	CleanResourcesResponse
	DataSource
	MinioConfig
	DataSourceEvent
	GetMinioConfigRequest
	GetMinioConfigResponse
	StorageStatsRequest
	StorageStatsResponse
	GetDataSourceConfigRequest
	GetDataSourceConfigResponse
*/
package object

import proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"
import _ "github.com/mwitkow/go-proto-validators"

import (
	client "github.com/micro/go-micro/client"
	server "github.com/micro/go-micro/server"
	context "context"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion2 // please upgrade the proto package

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ client.Option
var _ server.Option

// Client API for ObjectsEndpoint service

type ObjectsEndpointClient interface {
	GetMinioConfig(ctx context.Context, in *GetMinioConfigRequest, opts ...client.CallOption) (*GetMinioConfigResponse, error)
	StorageStats(ctx context.Context, in *StorageStatsRequest, opts ...client.CallOption) (*StorageStatsResponse, error)
}

type objectsEndpointClient struct {
	c           client.Client
	serviceName string
}

func NewObjectsEndpointClient(serviceName string, c client.Client) ObjectsEndpointClient {
	if c == nil {
		c = client.NewClient()
	}
	if len(serviceName) == 0 {
		serviceName = "object"
	}
	return &objectsEndpointClient{
		c:           c,
		serviceName: serviceName,
	}
}

func (c *objectsEndpointClient) GetMinioConfig(ctx context.Context, in *GetMinioConfigRequest, opts ...client.CallOption) (*GetMinioConfigResponse, error) {
	req := c.c.NewRequest(c.serviceName, "ObjectsEndpoint.GetMinioConfig", in)
	out := new(GetMinioConfigResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *objectsEndpointClient) StorageStats(ctx context.Context, in *StorageStatsRequest, opts ...client.CallOption) (*StorageStatsResponse, error) {
	req := c.c.NewRequest(c.serviceName, "ObjectsEndpoint.StorageStats", in)
	out := new(StorageStatsResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for ObjectsEndpoint service

type ObjectsEndpointHandler interface {
	GetMinioConfig(context.Context, *GetMinioConfigRequest, *GetMinioConfigResponse) error
	StorageStats(context.Context, *StorageStatsRequest, *StorageStatsResponse) error
}

func RegisterObjectsEndpointHandler(s server.Server, hdlr ObjectsEndpointHandler, opts ...server.HandlerOption) {
	s.Handle(s.NewHandler(&ObjectsEndpoint{hdlr}, opts...))
}

type ObjectsEndpoint struct {
	ObjectsEndpointHandler
}

func (h *ObjectsEndpoint) GetMinioConfig(ctx context.Context, in *GetMinioConfigRequest, out *GetMinioConfigResponse) error {
	return h.ObjectsEndpointHandler.GetMinioConfig(ctx, in, out)
}

func (h *ObjectsEndpoint) StorageStats(ctx context.Context, in *StorageStatsRequest, out *StorageStatsResponse) error {
	return h.ObjectsEndpointHandler.StorageStats(ctx, in, out)
}

// Client API for DataSourceEndpoint service

type DataSourceEndpointClient interface {
	GetDataSourceConfig(ctx context.Context, in *GetDataSourceConfigRequest, opts ...client.CallOption) (*GetDataSourceConfigResponse, error)
}

type dataSourceEndpointClient struct {
	c           client.Client
	serviceName string
}

func NewDataSourceEndpointClient(serviceName string, c client.Client) DataSourceEndpointClient {
	if c == nil {
		c = client.NewClient()
	}
	if len(serviceName) == 0 {
		serviceName = "object"
	}
	return &dataSourceEndpointClient{
		c:           c,
		serviceName: serviceName,
	}
}

func (c *dataSourceEndpointClient) GetDataSourceConfig(ctx context.Context, in *GetDataSourceConfigRequest, opts ...client.CallOption) (*GetDataSourceConfigResponse, error) {
	req := c.c.NewRequest(c.serviceName, "DataSourceEndpoint.GetDataSourceConfig", in)
	out := new(GetDataSourceConfigResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for DataSourceEndpoint service

type DataSourceEndpointHandler interface {
	GetDataSourceConfig(context.Context, *GetDataSourceConfigRequest, *GetDataSourceConfigResponse) error
}

func RegisterDataSourceEndpointHandler(s server.Server, hdlr DataSourceEndpointHandler, opts ...server.HandlerOption) {
	s.Handle(s.NewHandler(&DataSourceEndpoint{hdlr}, opts...))
}

type DataSourceEndpoint struct {
	DataSourceEndpointHandler
}

func (h *DataSourceEndpoint) GetDataSourceConfig(ctx context.Context, in *GetDataSourceConfigRequest, out *GetDataSourceConfigResponse) error {
	return h.DataSourceEndpointHandler.GetDataSourceConfig(ctx, in, out)
}

// Client API for ResourceCleanerEndpoint service

type ResourceCleanerEndpointClient interface {
	CleanResourcesBeforeDelete(ctx context.Context, in *CleanResourcesRequest, opts ...client.CallOption) (*CleanResourcesResponse, error)
}

type resourceCleanerEndpointClient struct {
	c           client.Client
	serviceName string
}

func NewResourceCleanerEndpointClient(serviceName string, c client.Client) ResourceCleanerEndpointClient {
	if c == nil {
		c = client.NewClient()
	}
	if len(serviceName) == 0 {
		serviceName = "object"
	}
	return &resourceCleanerEndpointClient{
		c:           c,
		serviceName: serviceName,
	}
}

func (c *resourceCleanerEndpointClient) CleanResourcesBeforeDelete(ctx context.Context, in *CleanResourcesRequest, opts ...client.CallOption) (*CleanResourcesResponse, error) {
	req := c.c.NewRequest(c.serviceName, "ResourceCleanerEndpoint.CleanResourcesBeforeDelete", in)
	out := new(CleanResourcesResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for ResourceCleanerEndpoint service

type ResourceCleanerEndpointHandler interface {
	CleanResourcesBeforeDelete(context.Context, *CleanResourcesRequest, *CleanResourcesResponse) error
}

func RegisterResourceCleanerEndpointHandler(s server.Server, hdlr ResourceCleanerEndpointHandler, opts ...server.HandlerOption) {
	s.Handle(s.NewHandler(&ResourceCleanerEndpoint{hdlr}, opts...))
}

type ResourceCleanerEndpoint struct {
	ResourceCleanerEndpointHandler
}

func (h *ResourceCleanerEndpoint) CleanResourcesBeforeDelete(ctx context.Context, in *CleanResourcesRequest, out *CleanResourcesResponse) error {
	return h.ResourceCleanerEndpointHandler.CleanResourcesBeforeDelete(ctx, in, out)
}
