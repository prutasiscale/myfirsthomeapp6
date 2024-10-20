import React from 'react';
import { Config } from '../types';
import Widget from './Widget';

interface WidgetContainerProps {
  config: Config;
  selectedHost: string | null;
  isHomeEnvironment: boolean;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({ config, selectedHost, isHomeEnvironment }) => {
  const widgetTypes = ['status', 'services', 'cpu', 'ram', 'disk'];

  if (!config || !config.widgets) {
    return <div className="text-gray-500 text-center">Loading widgets...</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2">
      {widgetTypes.map((widgetType) => (
        <Widget 
          key={widgetType}
          name={widgetType}
          scriptPath={config.widgets[widgetType]?.script_path || ''}
          selectedHost={selectedHost}
          isHomeEnvironment={isHomeEnvironment}
        />
      ))}
    </div>
  );
};

export default WidgetContainer;