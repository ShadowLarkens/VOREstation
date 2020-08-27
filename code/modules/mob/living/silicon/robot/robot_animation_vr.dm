/mob/living/silicon/robot/proc/transform_with_anim()
	// We invoke_async this so that our current mob can switch icons via module selection before we start animating the
	// transition.
	INVOKE_ASYNC(src, .proc/do_transform_animation)

/mob/living/silicon/robot/proc/do_transform_animation()
	notransform = TRUE
	dir = SOUTH
	// Mimic our current pre-transform appearance with this decoy
	var/obj/effect/temp_visual/decoy/fading/fivesecond/ANM = new /obj/effect/temp_visual/decoy/fading/fivesecond(loc, src)
	ANM.layer = layer - 0.01
	// Little bit of smoke to cover it all up
	new /obj/effect/temp_visual/small_smoke(loc)
	// Make our current sprite invisible now that the decoy is showing where we were
	alpha = 0
	// And sloooowly fade in over five seconds
	animate(src, alpha = 255, time = 50)
	// Prevent us from moving because the decoy won't move with us and we don't want invisible robots
	var/prev_lockcharge = lockcharge
	SetLockdown(1)
	anchored = TRUE
	// Then, we wait for a few ds before starting to play our "building" sounds
	sleep(2)
	for(var/i in 1 to 6)
		playsound(src, pick('sound/items/drill_use.ogg', 'sound/items/jaws_cut.ogg', 'sound/items/jaws_pry.ogg', 'sound/items/Welder.ogg', 'sound/items/Wirecutter.ogg', 'sound/items/Crowbar.ogg', 'sound/items/Ratchet.ogg'), 80, 1, -1)
		sleep(8)
	// Finally, we're done animating, we can unlock our mob if applicable
	if(!prev_lockcharge)
		SetLockdown(0)
	anchored = FALSE
	notransform = FALSE