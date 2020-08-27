/datum/tgui_module/module_selector
	name = "Module Selector"
	tgui_id = "ModuleSelection"

/datum/tgui_module/module_selector/New(host)
	if(!isrobot(host))
		qdel(src)
		return
	return ..()

/datum/tgui_module/module_selector/ui_assets(mob/user)
	. = ..()
	. += get_asset_datum(/datum/asset/spritesheet/module_selection)

/datum/tgui_module/module_selector/tgui_state(mob/user)
	return GLOB.tgui_self_state

/datum/tgui_module/module_selector/tgui_data(mob/user, datum/tgui/ui, datum/tgui_state/state)
	var/list/data = ..()

	var/mob/living/silicon/robot/R = host
	var/list/available_modules = list()
	if(R.shell)
		available_modules.Add(shell_module_types)
	else
		available_modules.Add(robot_module_types)
		if(R.crisis || security_level == SEC_LEVEL_RED || R.crisis_override)
			available_modules += "Combat"
			available_modules += "ERT"
	data["available_modules"] = available_modules

	return data

/datum/tgui_module/module_selector/tgui_static_data(mob/user, datum/tgui/ui, datum/tgui_state/state)
	var/list/data = ..()

	// We want *all* module types harvested; which ones show up is determined by tgui_data
	data["all_modules"] = harvest_module_data()

	return data

/datum/tgui_module/module_selector/proc/harvest_module_data()
	var/list/data = list()

	for(var/key in robot_modules)
		var/type = robot_modules[key]
		var/obj/item/weapon/robot_module/module_type = new type(null)
		module_type.vr_add_sprites()
		data.Add(list(list(
			"key" = key,
			"prefix" = module_type.prefix,
			"size" = module_type.prefix == "wide" ? "64x32" : (module_type.prefix == "big" ? "64x64" : "32x32"),
			"sprites" = module_type.sprites,
		)))
		qdel(module_type)

	return data