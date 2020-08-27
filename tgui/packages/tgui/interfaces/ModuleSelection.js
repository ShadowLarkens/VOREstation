import { round } from 'common/math';
import { Fragment } from 'inferno';
import { useBackend, useLocalState } from "../backend";
import { Box, Button, Flex, Icon, LabeledList, ProgressBar, Section, Tabs } from "../components";
import { Window } from "../layouts";
import { sortBy } from 'common/collections';
import { classes } from 'common/react';

export const ModuleSelection = (props, context) => {

  return (
    <Window width={800} height={600} resizable>
      <Window.Content scrollable>
        <ModuleSelectionContent />
      </Window.Content>
    </Window>
  );
};

const ModuleSelectionContent = (props, context) => {
  const { act, data } = useBackend(context);

  const {
    available_modules,
    all_modules,
  } = data;

  const [moduleKey, setModuleKey] = useLocalState(context, "moduleKey", null);

  const modules = all_modules.filter(module => available_modules.indexOf(module.key) !== -1);

  sortBy

  return (
    <Flex>
      <Flex.Item basis="20%">
        <Tabs vertical>
          {sortBy(m => m.key)(modules).map(module => (
            <Tabs.Tab
              key={module.key}
              selected={moduleKey === module.key}
              onClick={() => setModuleKey(module.key)}>
              {module.key}
            </Tabs.Tab>
          ))}
        </Tabs>
      </Flex.Item>
      <Flex.Item basis="80%">
        {moduleKey && <ModuleSelectionSprites module={moduleKey} /> || null}
      </Flex.Item>
    </Flex>
  );
};

const ModuleSelectionSprites = (props, context) => {
  const { act, data } = useBackend(context);

  const {
    all_modules,
  } = data;

  const {
    module,
  } = props;

  let richModule = all_modules.find(v => v.key === module);

  if (!richModule) {
    return "ERR";
  }

  const style32_32 = {
    transform: 'scale(4) translate(33%, 38%)',
    '-ms-interpolation-mode': 'nearest-neighbor',
  };

  const style64_32 = {
    transform: 'scale(4) translate(10%, 38%)',
    '-ms-interpolation-mode': 'nearest-neighbor',
  };

  const style64_64 = {
    transform: 'scale(3) translate(15%, -5%)',
    '-ms-interpolation-mode': 'nearest-neighbor',
  };

  const sizeToStyle = {
    '32x32': style32_32,
    '64x32': style64_32,
    '64x64': style64_64,
  };

  return (
    <Section>
      {Object.keys(richModule.sprites).map(key => {
        const iconState = richModule.sprites[key];

        return (
          <Button
            style={{
              width: '128px',
              height: '128px',
            }}>
            <img
              class={classes([
                'robotModule' + richModule.size,
                'south-' + iconState,
              ])}
              style={sizeToStyle[richModule.size]} />
          </Button>
        );
      })}
    </Section>
  );
};