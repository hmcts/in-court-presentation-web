locals {
  app_full_name = "${var.product}-${var.component}"
  ase_name = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"
  local_env = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
  vault_name = "${var.shared_product_name}-${local.local_env}"
}
# "${local.ase_name}"
# "${local.app_full_name}"
# "${local.local_env}"

module "app" {
  source = "git@github.com:hmcts/moj-module-webapp?ref=master"
  product = "${local.app_full_name}"
  location = "${var.location}"
  env = "${var.env}"
  ilbIp = "${var.ilbIp}"
  subscription = "${var.subscription}"
  capacity     = "${var.capacity}"
  is_frontend = "${!(var.env == "preview" || var.env == "spreview") ? 1 : 0}"
  additional_host_name = "in-court-presentation.${var.env == "aat" ? "nonprod" : var.env}.platform.hmcts.net"
  https_only="false"
  web_sockets_enabled="true"
  common_tags  = "${var.common_tags}"

  app_settings = {
    # REDIS_HOST = "${module.redis-cache.host_name}"
    # REDIS_PORT = "${module.redis-cache.redis_port}"
    # REDIS_PASSWORD = "${module.redis-cache.access_key}"
    # RECIPE_BACKEND_URL = "http://rhubarb-recipe-backend-${var.env}.service.${data.terraform_remote_state.core_apps_compute.ase_name[0]}.internal"
    WEBSITE_NODE_DEFAULT_VERSION = "8.8.0"

    # NODE_ENV = "${var.env}"
    # PORT = "8080"
    S2S_SECRET = "${data.azurerm_key_vault_secret.s2s_secret.value}"
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

data "azurerm_key_vault" "key_vault" {
  name = "${local.vault_name}"
  resource_group_name = "${local.vault_name}"
}

data "azurerm_key_vault_secret" "s2s_secret" {
  name = "jui-s2s-token"
  vault_uri = "${data.azurerm_key_vault.key_vault.vault_uri}"
}

data "azurerm_key_vault_secret" "oauth2_secret" {
  name = "jui-oauth2-token"
  vault_uri = "${data.azurerm_key_vault.key_vault.vault_uri}"
}
