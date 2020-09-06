import { toFixed, round } from 'common/math';
import { Fragment } from 'inferno';
import { useBackend, useLocalState, useSharedState } from "../backend";
import { Box, Button, Flex, Icon, LabeledList, ProgressBar, Section, Collapsible, NumberInput, Divider } from "../components";
import { Window } from "../layouts";
import { T0C, RADIO_CHANNELS } from '../constants';
import { decodeHtmlEntities } from 'common/string';

const mechaDefineToName = {
  "hull": "Hull Module",
  "weapon": "Weapon Module",
  "utility": "Utility Module",
  "core": "Special Module",
  "micro_utility": "Micro Utility Module",
  "micro_weapon": "Micro Weapon Module",
}; // else Universal Module

export const Mecha = (props, context) => {
  const { act, data } = useBackend(context);

  const [theme, setTheme] = useLocalState(context, "mechatheme", 1);
  const [viewingLog, setViewingLog] = useSharedState(context, "viewingLog", false);

  return (
    <Window theme={theme ? "hackerman" : null} width={400} height={500}>
      <Window.Content
        backgroundColor={theme ? "#000" : null}
        scrollable
        fontFamily={theme ? "\"Lucida Console\",monospace" : null}>
        {viewingLog && (
          <MechaLog theme={theme} setViewingLog={setViewingLog} />
        ) || (
          <Fragment>
            <MechaStatus theme={theme} setTheme={setTheme} />
            <MechaCommands theme={theme} setViewingLog={setViewingLog} />
            <Section title={theme ? " " : null}>
              <Button
                icon="eject"
                onClick={() => act("eject")}
                fluid>
                EJECT
              </Button>
            </Section>
          </Fragment>
        )}
      </Window.Content>
    </Window>
  );
};

const MechaLog = (props, context) => {
  const { act, data } = useBackend(context);

  const {
    theme,
    setViewingLog,
  } = props;

  const {
    log,
  } = data;

  return (
    <Section
      title="Mecha Log"
      backgroundColor={theme ? "#000" : null}
      m={theme ? -1 : null}
      buttons={
        <Button
          icon="undo"
          m={-0.7}
          onClick={() => setViewingLog(false)} />
      }>
      {log.map(entry => (
        <Box key={entry.time} mb={2}>
          <Box bold>{entry.time} {entry.year}</Box>
          {decodeHtmlEntities(entry.message)
            .split("\n")
            .map((msg, i) => <Box key={i} ml={4}>{msg}</Box>)}
        </Box>
      ))}
    </Section>
  );
};

const MechaStatus = (props, context) => {
  const { act, data } = useBackend(context);

  const {
    theme,
    setTheme,
  } = props;

  const {
    equipment,
  } = data;

  const {
    integrity,
    cell_charge,
    tank_pressure,
    tank_temperature,
    cabin_pressure,
    cabin_temperature,
    use_internal_tank,
    hull_integrity,
    armor_integrity,
    lights,
    dna,
    damflags,
    defence_mode_possible,
    defense_mode,
    overload_possible,
    overload,
    smoke_possible,
    smoke_reserve,
    thrusters_possible,
    thrusters,
    cargo,
  } = data.stats;

  return (
    <Section
      title="Status"
      backgroundColor={theme ? "#000" : null}
      color={theme ? "#0d0" : null}
      m={theme ? -1 : null}
      buttons={
        <Button
          icon="eye"
          m={-0.7}
          onClick={() => setTheme(!theme)} />
      }>
      <LabeledList>
        <LabeledList.Item
          label="Armor Integrity"
          labelColor={theme ? "#0d0" : null}
          color={armor_integrity < 30 ? "bad" : "#0d0"}
          className="MechaRow">
          {armor_integrity > 0 ? armor_integrity + "%" : "[ARMOR MISSING]"}
        </LabeledList.Item>
        <LabeledList.Item
          label="Hull Integrity"
          labelColor={theme ? "#0d0" : null}
          color={hull_integrity < 30 ? "bad" : "#0d0"}
          className="MechaRow">
          {hull_integrity > 0 ? hull_integrity + "%" : "[HULL MISSING]"}
        </LabeledList.Item>
        <LabeledList.Item
          label="Chassis Integrity"
          labelColor={theme ? "#0d0" : null}
          color={integrity < 30 ? "bad" : "#0d0"}
          className="MechaRow">
          {integrity}%
        </LabeledList.Item>
        <LabeledList.Item
          label="Powercell Charge"
          labelColor={theme ? "#0d0" : null}
          color={cell_charge < 50 ? "bad" : "#0d0"}
          className="MechaRow">
          {cell_charge}%
        </LabeledList.Item>
        <LabeledList.Item
          label="Air Source"
          labelColor={theme ? "#0d0" : null}
          color="#0d0"
          className="MechaRow">
          {use_internal_tank ? "Internal Airtank" : "Environment"}
        </LabeledList.Item>
        <LabeledList.Item
          label="Airtank Pressure"
          labelColor={theme ? "#0d0" : null}
          color="#0d0"
          className="MechaRow">
          {tank_pressure}kPa
        </LabeledList.Item>
        <LabeledList.Item
          label="Airtank Temperature"
          labelColor={theme ? "#0d0" : null}
          color="#0d0"
          className="MechaRow">
          {round(tank_temperature, 4)}K | {round(tank_temperature - T0C, 4)}&deg;C
        </LabeledList.Item>
        <LabeledList.Item
          label="Cabin Pressure"
          labelColor={theme ? "#0d0" : null}
          color="#0d0"
          className="MechaRow">
          {cabin_pressure}kPa
        </LabeledList.Item>
        <LabeledList.Item
          label="Cabin Temperature"
          labelColor={theme ? "#0d0" : null}
          color="#0d0"
          className="MechaRow">
          {round(cabin_temperature, 4)}K | {round(cabin_temperature - T0C, 4)}&deg;C
        </LabeledList.Item>
        <LabeledList.Item
          label="Lights"
          labelColor={theme ? "#0d0" : null}
          color="#0d0"
          className="MechaRow">
          {lights ? "On" : "Off"}
        </LabeledList.Item>
        {!!dna && (
          <LabeledList.Item
            label="DNA-locked"
            labelColor={theme ? "#0d0" : null}
            color="#0d0"
            className="MechaRow">
            <Box style={{
              "word-break": "break-all",
            }}>
              {dna}
              <Button
                icon="unlock"
                onClick={() => act("reset_dna")} />
            </Box>
          </LabeledList.Item>
        )}
        {!!defence_mode_possible && (
          <LabeledList.Item
            label="Defense Mode"
            labelColor={theme ? "#0d0" : null}
            color="#0d0"
            className="MechaRow">
            {defense_mode ? "On" : "Off"}
          </LabeledList.Item>
        )}
        {!!overload_possible && (
          <LabeledList.Item
            label="Leg actuators overload"
            labelColor={theme ? "#0d0" : null}
            color="#0d0"
            className="MechaRow">
            {overload ? "On" : "Off"}
          </LabeledList.Item>
        )}
        {!!smoke_possible && (
          <LabeledList.Item
            label="Smoke"
            labelColor={theme ? "#0d0" : null}
            color="#0d0"
            className="MechaRow">
            {smoke_reserve}
          </LabeledList.Item>
        )}
        {!!thrusters_possible && (
          <LabeledList.Item
            label="Thrusters"
            labelColor={theme ? "#0d0" : null}
            color="#0d0"
            className="MechaRow">
            {thrusters ? "On" : "Off"}
          </LabeledList.Item>
        )}
        <LabeledList.Item
          label="Cargo Compartment Contents"
          labelColor={theme ? "#0d0" : null}
          color="#0d0"
          className="MechaRow" />
        {cargo.length && cargo.map(c => (
          <Box ml={4} key={c.ref}>
            <Button
              onClick={() => act("drop_from_cargo", { drop_from_cargo: c.ref })}>
              Unload {c.name}
            </Button>
          </Box>
        )) || (
          <Box ml={4}>
            Nothing
          </Box>
        )}
        {!!equipment.length && (
          <Fragment>
            <LabeledList.Item
              label="Equipment Selection"
              labelColor={theme ? "#0d0" : null}
              color="#0d0"
              className="MechaRow" />
            {equipment.map(c => (
              <Box ml={4} key={c.ref}>
                <Button
                  disabled={c.selected}
                  content={c.name}
                  onClick={() => act("select_equip", { select_equip: c.ref })} />
              </Box>
            ))}
          </Fragment>
        )}
      </LabeledList>
    </Section>
  );
};

const MechaCommands = (props, context) => {
  const { act, data } = useBackend(context);

  const {
    theme,
    setViewingLog,
  } = props;

  const {
    radio,
    connected_to_port,
    add_req_access,
    maint_access,
  } = data.commands;

  const {
    use_internal_tank,
  } = data.stats;

  const tunedChannel = RADIO_CHANNELS
    .find(channel => channel.freq === Number(radio.freq));
  
  return (
    <Section
      title="Controls"
      backgroundColor={theme ? "#000" : null}
      color={theme ? "#0d0" : null}
      m={theme ? -1 : null}>
      <Collapsible title="Electronics">
        <Button
          className="MechaButton"
          fluid
          icon="lightbulb-o"
          onClick={() => act("toggle_lights")}>
          Toggle Lights
        </Button>
        <Box mb={1} textAlign="center">Radio Settings</Box>
        <LabeledList>
          <LabeledList.Item
            label="Microphone"
            labelColor={theme ? "#0d0" : null}
            color="#0d0"
            className="MechaRow">
            <Button
              textAlign="center"
              fluid
              icon={radio.broadcasting ? 'volume-up' : 'volume-mute'}
              selected={radio.broadcasting}
              onClick={() => act('rmictoggle')}>
              {radio.broadcasting ? "Engaged" : "Disengaged"}
            </Button>
          </LabeledList.Item>
          <LabeledList.Item
            label="Speaker"
            labelColor={theme ? "#0d0" : null}
            color="#0d0"
            className="MechaRow">
            <Button
              textAlign="center"
              fluid
              icon={radio.listening ? 'volume-up' : 'volume-mute'}
              selected={radio.listening}
              onClick={() => act('rspktoggle')}>
              {radio.listening ? "Engaged" : "Disengaged"}
            </Button>
          </LabeledList.Item>
          <LabeledList.Item
            label="Frequency"
            labelColor={theme ? "#0d0" : null}
            color="#0d0"
            className="MechaRow">
            <NumberInput
              animated
              color="good"
              unit="kHz"
              step={0.2}
              stepPixelSize={10}
              minValue={1441 / 10}
              maxValue={1489 / 10}
              value={radio.freq / 10}
              format={value => toFixed(value, 1)}
              onDrag={(e, value) => act('rfreq', {
                rfreq: round(value * 10),
              })} />
            {tunedChannel && (
              <Box inline color={tunedChannel.color} ml={2}>
                [{tunedChannel.name}]
              </Box>
            )}
          </LabeledList.Item>
        </LabeledList>
      </Collapsible>
      <Collapsible title="Airtank">
        <LabeledList>
          <LabeledList.Item
            label="Toggle Internal Airtank Usage"
            labelColor={theme ? "#0d0" : null}
            color="good"
            className="MechaRow">
            <Button
              icon="wind"
              onClick={() => act("toggle_airtank")}
              content={use_internal_tank ? "Enabled" : "Disabled"} />
          </LabeledList.Item>
          <LabeledList.Item
            label={connected_to_port ? "Disconnect from port" : "Connect to port"}
            labelColor={theme ? "#0d0" : null}
            color="good"
            className="MechaRow">
            <Button
              icon={connected_to_port ? "unlink" : "link"}
              onClick={() => act(connected_to_port ? "port_disconnect" : "port_connect")} />
          </LabeledList.Item>
        </LabeledList>
      </Collapsible>
      <Collapsible title="Permissions & Logging">
        <Button
          className="MechaButton"
          fluid
          icon={add_req_access ? "unlock" : "lock"}
          onClick={() => act("toggle_id_upload")}>
          {add_req_access ? "ID Upload Unlocked" : "ID Upload Locked"}
        </Button>
        <Button
          className="MechaButton"
          fluid
          icon={maint_access ? "unlock" : "lock"}
          onClick={() => act("toggle_maint_access")}>
          {maint_access ? "Maintenance Protocols Unlocked" : "Maintenance Protocols Locked"}
        </Button>
        <Button
          className="MechaButton"
          fluid
          icon={"lock"}
          onClick={() => act("dna_lock")}>
          Enable DNA-Lock
        </Button>
        <Button
          className="MechaButton"
          fluid
          icon="file"
          onClick={() => setViewingLog(true)}>
          View internal log
        </Button>
        <Button
          className="MechaButton"
          fluid
          icon="pen"
          onClick={() => act("change_name")}>
          Change exosuit name
        </Button>
      </Collapsible>
      <MechaEquipment theme={theme} />
    </Section>
  );
};

const MechaEquipment = (props, context) => {
  const { act, data } = useBackend(context);

  const {
    theme,
  } = props;

  const {
    avail_hull_equip,
    avail_weapon_equip,
    avail_micro_weapon_equip,
    avail_utility_equip,
    avail_micro_utility_equip,
    avail_universal_equip,
    avail_special_equip,
  } = data.stats;

  const {
    equipment,
  } = data;

  return (
    <Collapsible title="Equipment">
      {!!equipment.length && (
        <Box mb={1}>
          <LabeledList>
            {equipment.map(item => (
              <LabeledList.Item
                labelColor="#0d0"
                key={item.ref}
                label={mechaDefineToName[item.equip_type] || "Universal Module"}
                buttons={
                  <Button
                    lineHeight={1}
                    icon="eject"
                    content="Detach"
                    onClick={() => act("detach_eqp", { ref: item.ref })} />
                }>
                {item.name}
              </LabeledList.Item>
            ))}
          </LabeledList>
        </Box>
      )}
      <LabeledList>
        <LabeledList.Item
          label="Available Hull Slots"
          labelColor={theme ? "#0d0" : null}
          color={"good"}
          className="MechaRow">
          {avail_hull_equip}
        </LabeledList.Item>
        <LabeledList.Item
          label="Available Weapon Slots"
          labelColor={theme ? "#0d0" : null}
          color={"good"}
          className="MechaRow">
          {avail_weapon_equip}
        </LabeledList.Item>
        <LabeledList.Item
          label="Available Micro Weapon Slots"
          labelColor={theme ? "#0d0" : null}
          color={"good"}
          className="MechaRow">
          {avail_micro_weapon_equip}
        </LabeledList.Item>
        <LabeledList.Item
          label="Available Utility Slots"
          labelColor={theme ? "#0d0" : null}
          color={"good"}
          className="MechaRow">
          {avail_utility_equip}
        </LabeledList.Item>
        <LabeledList.Item
          label="Available Micro Utility Slots"
          labelColor={theme ? "#0d0" : null}
          color={"good"}
          className="MechaRow">
          {avail_micro_utility_equip}
        </LabeledList.Item>
        <LabeledList.Item
          label="Available Universal Slots"
          labelColor={theme ? "#0d0" : null}
          color={"good"}
          className="MechaRow">
          {avail_universal_equip}
        </LabeledList.Item>
        <LabeledList.Item
          label="Available Special Slots"
          labelColor={theme ? "#0d0" : null}
          color={"good"}
          className="MechaRow">
          {avail_special_equip}
        </LabeledList.Item>
      </LabeledList>
    </Collapsible>
  );
};