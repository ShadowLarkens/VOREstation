/mob/living/silicon/robot/Login()
	..()
	regenerate_icons()
	update_hud()

	show_laws(0)

	// Override the DreamSeeker macro with the borg version!
	client.set_hotkeys_macro("borgmacro", "borghotkeymode")

	// Forces synths to select an icon relevant to their module
	if(!icon_selected || module_selector)
		module_selector.tgui_interact(src)
		choose_icon(icon_selection_tries, module_sprites) // TGUITODO: Remove
	plane_holder.set_vis(VIS_AUGMENTED, TRUE) //VOREStation Add - ROBOT VISION IS AUGMENTED