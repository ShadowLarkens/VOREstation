/obj/mecha/tgui_interact(mob/user, datum/tgui/ui, datum/tgui/parent_ui)
	ui = SStgui.try_update_ui(user, src, ui)
	if(!ui)
		ui = new(user, src, "Mecha", name)
		ui.open()

/obj/mecha/tgui_state(mob/user)
	return GLOB.tgui_contained_state

/obj/mecha/tgui_data(mob/user, datum/tgui/ui, datum/tgui_state/state)
	var/list/data = ..()

	// Replaces get_stats_part()
	data["stats"] = tgui_stats(user)

	// Replaces get_equipment_list()
	data["equipment"] = tgui_equipment_data(user)

	// Replaces get_commands()
	data["commands"] = tgui_commands_data(user)

	// Etc
	data["log"] = get_log_tgui()

	return data

/obj/mecha/proc/tgui_stats(mob/user)
	var/list/data = list()

	data["integrity"] = (health / initial(health)) * 100
	data["cell_charge"] = cell?.percent()
	data["tank_pressure"] = internal_tank ? round(internal_tank.return_pressure(), 0.01) : -1
	data["tank_temperature"] = internal_tank ? internal_tank.return_temperature() : -1
	data["cabin_pressure"] = round(return_pressure(),0.01)
	data["cabin_temperature"] = return_temperature()
	data["use_internal_tank"] = use_internal_tank

	var/obj/item/mecha_parts/component/hull/HC = internal_components[MECH_HULL]
	var/obj/item/mecha_parts/component/armor/AC = internal_components[MECH_ARMOR]

	data["hull_integrity"] = HC ? round(HC.integrity / HC.max_integrity * 100, 0.1) : -1
	data["armor_integrity"] = AC ? round(AC.integrity / AC.max_integrity * 100, 0.1) : -1

	data["lights"] = lights
	data["dna"] = dna

	data["damflags"] = list()
	var/list/dam_flags = list(
		"[MECHA_INT_FIRE]" = "MECHA_INT_FIRE",
		"[MECHA_INT_TEMP_CONTROL]" = "MECHA_INT_TEMP_CONTROL",
		"[MECHA_INT_TANK_BREACH]" = "MECHA_INT_TANK_BREACH",
		"[MECHA_INT_CONTROL_LOST]" = "MECHA_INT_CONTROL_LOST",
		"[MECHA_INT_SHORT_CIRCUIT]" = "MECHA_INT_SHORT_CIRCUIT")
	for(var/tflag in dam_flags)
		var/intdamflag = text2num(tflag)
		if(hasInternalDamage(intdamflag))
			data["damflags"].Add(dam_flags[tflag])
	if(return_pressure() > WARNING_HIGH_PRESSURE)
		data["damflags"].Add("WARNING_HIGH_PRESSURe")

	data["defence_mode_possible"] = defence_mode_possible
	data["defense_mode"] = defence_mode
	data["overload_possible"] = overload_possible
	data["overload"] = overload
	data["smoke_possible"] = smoke_possible
	data["smoke_reserve"] = smoke_reserve
	data["thrusters_possible"] = thrusters_possible
	data["thrusters"] = thrusters

	data["cargo"] = list()
	if(LAZYLEN(cargo))
		for(var/M in cargo)
			data["cargo"].Add(list(list(
				"name" = "[M]",
				"ref" = "\ref[M]"
			)))

	data["avail_hull_equip"] = max_hull_equip - hull_equipment.len
	data["avail_weapon_equip"] = max_weapon_equip - weapon_equipment.len
	data["avail_micro_weapon_equip"] = max_micro_weapon_equip - micro_weapon_equipment.len
	data["avail_utility_equip"] = max_utility_equip - utility_equipment.len
	data["avail_micro_utility_equip"] = max_micro_utility_equip - micro_utility_equipment.len
	data["avail_universal_equip"] = max_universal_equip - universal_equipment.len
	data["avail_special_equip"] = max_special_equip - special_equipment.len

	return data

/obj/mecha/proc/tgui_equipment_data(mob/user)
	var/list/data = list()

	for(var/obj/item/mecha_parts/mecha_equipment/MT in equipment)
		data.Add(list(list(
			"ref" = "\ref[MT]",
			"name" = MT.name,
			"data" = MT.tgui_data(),
			"equip_type" = MT.equip_type,
			"selected" = selected == MT,
		)))

	return data

/obj/mecha/proc/tgui_commands_data(mob/user)
	var/list/data = list()

	data["radio"] = list(
		"broadcasting" = radio.broadcasting,
		"listening" = radio.listening,
		"freq" = radio.frequency,
	)

	// This is horrifying.
	data["connected_to_port"] = (/obj/mecha/verb/disconnect_from_port in verbs)

	data["add_req_access"] = add_req_access
	data["maint_access"] = maint_access

	return data

/obj/mecha/tgui_act(action, list/params, datum/tgui/ui, datum/tgui_state/ui_state)
	if(..())
		return TRUE

	switch(action)
		if("select_equip")
			var/obj/item/mecha_parts/mecha_equipment/equip = locate(params["select_equip"])
			if(istype(equip))
				selected = equip
				occupant_message("You switch to [equip]")
				visible_message("[src] raises [equip]")
			return TRUE

		if("eject")
			eject()
			return TRUE

		if("toggle_lights")
			lights()
			return TRUE

		if("toggle_strafing")
			strafing()
			return TRUE

		if("toggle_airtank")
			internal_tank()
			return TRUE

		if("toggle_thrusters")
			toggle_thrusters()
			return TRUE

		if("smoke")
			smoke()
			return TRUE

		if("toggle_zoom")
			zoom()
			return TRUE

		if("toggle_defence_mode")
			defence_mode()
			return TRUE

		if("switch_damtype")
			switch_damtype()
			return TRUE

		if("phasing")
			phasing()
			return TRUE

		if("rmictoggle")
			radio.broadcasting = !radio.broadcasting
			return TRUE

		if("rspktoggle")
			radio.listening = !radio.listening
			return TRUE

		if("rfreq")
			radio.set_frequency(sanitize_frequency(params["rfreq"], PUBLIC_LOW_FREQ, PUBLIC_HIGH_FREQ))
			return TRUE

		if("port_disconnect")
			disconnect_from_port()
			return TRUE

		if("port_connect")
			connect_to_port()
			return TRUE

		if("change_name")
			var/newname = sanitizeSafe(input(occupant,"Choose new exosuit name","Rename exosuit",initial(name)) as text, MAX_NAME_LEN)
			if(newname)
				name = newname
			else
				alert(occupant, "nope.avi")
			return TRUE

		if("toggle_id_upload")
			add_req_access = !add_req_access
			return TRUE

		if("toggle_maint_access")
			if(state)
				occupant_message("<font color='red'>Maintenance protocols in effect.</font>")
				return TRUE
			maint_access = !maint_access
			return TRUE

		if("set_internal_tank_valve")
			if(state < MECHA_BOLTS_SECURED)
				return
			if(usr)
				var/new_pressure = input(usr, "Input new output pressure", "Pressure setting", internal_tank_valve) as num
				if(new_pressure)
					internal_tank_valve = new_pressure
					to_chat(usr, "The internal pressure valve has been set to [internal_tank_valve]kPa.")

		if("dna_lock")
			if(istype(occupant, /mob/living/carbon/brain))
				occupant_message("You are a brain. No.")
				return FALSE
			if(occupant)
				dna = occupant.dna.unique_enzymes
				occupant_message("You feel a prick as the needle takes your DNA sample.")
			return TRUE

		if("reset_dna")
			dna = null
			return TRUE

		if("repair_int_control_lost")
			occupant_message("Recalibrating coordination system.")
			log_message("Recalibration of coordination system started.")
			
			var/T = loc
			if(do_after(100))
				if(T == loc)
					clearInternalDamage(MECHA_INT_CONTROL_LOST)
					occupant_message("<font color='blue'>Recalibration successful.</font>")
					log_message("Recalibration of coordination system finished with 0 errors.")
				else
					occupant_message("<font color='red'>Recalibration failed.</font>")
					log_message("Recalibration of coordination system failed with 1 error.",1)
			return TRUE

		if("drop_from_cargo")
			var/obj/O = locate(params["drop_from_cargo"])
			if(O && O in cargo)
				occupant_message("<span class='notice'>You unload [O].</span>")
				O.forceMove(get_turf(src))
				cargo -= O
				var/turf/T = get_turf(O)
				if(T)
					T.Entered(O)
				log_message("Unloaded [O]. Cargo compartment capacity: [cargo_capacity - cargo.len]")
			return TRUE
		
		if("detach_eqp")
			var/obj/item/mecha_parts/mecha_equipment/O = locate(params["ref"]) in equipment
			if(istype(O))
				O.detach()
			return TRUE