locals {
  app_full_name = "${var.product}-${var.component}"
  ase_name = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"
  local_env = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
}
# "${local.ase_name}"
# "${local.app_full_name}"

module "app" {
  source = "git@github.com:hmcts/moj-module-webapp?ref=Louisblack-patch-1"
  product = "${local.app_full_name}"
  location = "${var.location}"
  env = "${var.env}"
  ilbIp = "${var.ilbIp}"
  subscription = "${var.subscription}"
  capacity     = "${var.capacity}"
  is_frontend = true
  additional_host_name = "${local.app_full_name}-${var.env}.service.${var.env}.platform.hmcts.net"
  https_only="true"
  web_sockets_enabled="true"

  app_settings = {
    # REDIS_HOST = "${module.redis-cache.host_name}"
    # REDIS_PORT = "${module.redis-cache.redis_port}"
    # REDIS_PASSWORD = "${module.redis-cache.access_key}"
    # RECIPE_BACKEND_URL = "http://rhubarb-recipe-backend-${var.env}.service.${data.terraform_remote_state.core_apps_compute.ase_name[0]}.internal"
    WEBSITE_NODE_DEFAULT_VERSION = "8.8.0"

    # NODE_ENV = "${var.env}"
    # PORT = "8080"
    S2S_SECRET = "${data.vault_generic_secret.s2s_secret.data["value"]}"
    S2S_NAME = "${var.s2s_service_name}"

    # logging vars & healthcheck
    REFORM_SERVICE_NAME = "${local.app_full_name}"
    REFORM_TEAM = "${var.team_name}"
    REFORM_SERVICE_TYPE = "${var.app_language}"
    REFORM_ENVIRONMENT = "${var.env}"

    PACKAGES_NAME = "${local.app_full_name}"
    PACKAGES_PROJECT = "${var.team_name}"
    PACKAGES_ENVIRONMENT = "${var.env}"

    ROOT_APPENDER = "${var.root_appender}"
    JSON_CONSOLE_PRETTY_PRINT = "${var.json_console_pretty_print}"
    LOG_OUTPUT = "${var.log_output}"
  }
}
provider "vault" {
  address = "https://vault.reform.hmcts.net:6200"
}

data "vault_generic_secret" "s2s_secret" {
  path = "secret/${var.vault_section}/ccidam/service-auth-provider/api/microservice-keys/em-gw"
}

module "key_vault" {
  source = "git@github.com:hmcts/moj-module-key-vault?ref=master"
  product = "${local.app_full_name}"
  env = "${var.env}"
  tenant_id = "${var.tenant_id}"
  object_id = "${var.jenkins_AAD_objectId}"
  resource_group_name = "${module.app.resource_group_name}"
  product_group_object_id = "5d9cd025-a293-4b97-a0e5-6f43efce02c0"
}

resource "azurerm_key_vault_secret" "S2S_TOKEN" {
  name = "s2s-token"
  value = "${data.vault_generic_secret.s2s_secret.data["value"]}"
  vault_uri = "${module.key_vault.key_vault_uri}"
}
