/**
 * # Hear Component
 *
 * Listens for messages. Requires a shell.
 */
/obj/item/circuit_component/hear
	display_name = "Voice Activator"

	/// The message heard
	var/datum/port/output/message_port
	/// The language heard
	var/datum/port/output/language_port
	/// The speaker
	var/datum/port/output/speaker_port
	/// The trigger sent when this event occurs
	var/datum/port/output/trigger_port

/obj/item/circuit_component/hear/Initialize()
	. = ..()
	listening_objects |= src
	message_port = add_output_port("Message", PORT_TYPE_STRING)
	language_port = add_output_port("Dominant Language", PORT_TYPE_STRING)
	speaker_port = add_output_port("Speaker", PORT_TYPE_ATOM)
	trigger_port = add_output_port("Triggered", PORT_TYPE_SIGNAL)


/obj/item/circuit_component/hear/Destroy()
	listening_objects -= src
	message_port = null
	language_port = null
	speaker_port = null
	trigger_port = null
	return ..()

// /obj/item/circuit_component/hear/Hear(message, atom/movable/speaker, datum/language/message_language, raw_message, radio_freq, list/spans, list/message_mods)
/obj/item/circuit_component/hear/hear_talk(mob/speaker, list/message_pieces, verb)
	if(speaker == parent?.shell)
		return

	var/msg = multilingual_to_message(message_pieces, requires_machine_understands = TRUE)

	var/max = 0
	var/dominant_language = "Galactic Common"
	var/list/language_count = list()
	for(var/datum/multilingual_say_piece/S in message_pieces)
		var/key = "[S.speaking]" // allows "null" the string
		language_count[key] += length(S.message) // yes this works for keys that aren't in the list, 10/10

		if(language_count[key] > max)
			dominant_language = key
			max = language_count[key]

	if(dominant_language == "null")
		dominant_language = "Galactic Common"

	message_port.set_output(msg)
	language_port.set_output(dominant_language)
	speaker_port.set_output(speaker)
	trigger_port.set_output(COMPONENT_SIGNAL)
