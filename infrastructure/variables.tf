variable "product" {
  type = "string"
}

variable "shared_product_name" {
  default = "rpa"
}

variable "component" {
  type = "string"
}

variable "team_name" {
  default = "rpa"
}

variable "app_language" {
  default = "node"
}

variable "location" {
  type = "string"
  default = "UK South"
}

variable "env" {
  type = "string"
}

variable "subscription" {
  type = "string"
}

variable "ilbIp"{}

variable "tenant_id" {}

variable "jenkins_AAD_objectId" {
  type                        = "string"
  description                 = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "common_tags" {
  type = "map"
}
////////////////////////////////////////////////
//Addtional Vars ///////////////////////////////
////////////////////////////////////////////////
variable "capacity" {
  default = "1"
}

////////////////////////////////////////////////
// Logging
////////////////////////////////////////////////
variable "root_appender" {
  default = "JSON_CONSOLE"
}

variable "json_console_pretty_print" {
  default = "false"
}

variable "log_output" {
  default = "single"
}

////////////////////////////////////////////////
// Toggle Features
////////////////////////////////////////////////

////////////////////////////////////////////////
// Addtional
////////////////////////////////////////////////
variable "s2s_service_name" {
  default = "jui_webapp"
}
