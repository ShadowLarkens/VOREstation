/**
 * # Radio Component
 *
 * Listens out for signals on the designated frequencies and sends signals on designated frequencies
 */
/obj/item/circuit_component/radio
	display_name = "Radio"

	/// Frequency input
	var/datum/port/input/freq
	/// Signal input
	var/datum/port/input/code

	/// Current frequency value
	var/current_freq = SIGNALER_FREQ

	var/datum/radio_frequency/radio_connection

/obj/item/circuit_component/radio/Initialize()
	. = ..()
	freq = add_input_port("Frequency", PORT_TYPE_NUMBER, default = SIGNALER_FREQ)
	code = add_input_port("Code", PORT_TYPE_NUMBER, default = DEFAULT_SIGNALER_CODE)
	// These are cleaned up on the parent
	trigger_input = add_input_port("Send", PORT_TYPE_SIGNAL)
	trigger_output = add_output_port("Received", PORT_TYPE_SIGNAL)

/obj/item/circuit_component/radio/Destroy()
	freq = null
	code = null
	radio_controller.remove_object(src, current_freq)
	radio_connection = null
	return ..()

/obj/item/circuit_component/radio/input_received(datum/port/input/port)
	. = ..()
	freq.set_input(sanitize_frequency(freq.input_value, TRUE), FALSE)
	if(.)
		return
	var/frequency = freq.input_value

	radio_controller.remove_object(src, current_freq)
	radio_connection = radio_controller.add_object(src, frequency, RADIO_CHAT)
	current_freq = frequency

	if(COMPONENT_TRIGGERED_BY(trigger_input, port))
		var/datum/signal/signal = new
		signal.source = src
		signal.encryption = round(code.input_value) || 0
		signal.data["message"] = "ACTIVATE"
		radio_connection.post_signal(src, signal)

/obj/item/circuit_component/radio/receive_signal(datum/signal/signal)
	. = FALSE
	if(!signal)
		return
	if(signal.encryption != round(code.input_value || 0))
		return

	trigger_output.set_output(COMPONENT_SIGNAL)
