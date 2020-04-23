import { Any, JsonObject, JsonProperty } from "json2typescript";

@JsonObject("CreateClusterRequest")
export class CreateClusterRequest {
  @JsonProperty("region_name")
  public readonly regionName: string = "";

  constructor(partial?: Partial<CreateClusterRequest>) {
    Object.assign(this, partial);
  }
}

@JsonObject("CreateClusterResponse")
export class CreateClusterResponse {
  @JsonProperty("cluster_name")
  public readonly clusterName: string = "";

  constructor(partial?: Partial<CreateClusterResponse>) {
    Object.assign(this, partial);
  }
}
