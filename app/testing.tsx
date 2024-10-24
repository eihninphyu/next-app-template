"use client";
import { useState } from "react";
import { Accordion, AccordionItem, Card, CardBody, Input, ScrollShadow, Select, SelectItem, Switch } from "@nextui-org/react";
import sections from "./data";

type ConfidenceLevels = {
  HIGH: number;
  LOW: number;
  MEDIUM: number;
  VERY_HIGH: number;
  VERY_LOW: number;
};
// Define the structure for confidence levels
// Define the type for confidenceLevels state
type ConfidenceLevelsState = {
  [index: number]: ConfidenceLevels; // Indexed by section index (number)
};

export default function AppTesting() {
  // State to store the confidence levels input values for each section
  const [confidenceLevels, setConfidenceLevels] = useState<ConfidenceLevelsState>(
    sections.reduce((acc, section, index) => {
      acc[index] = { ...section.configs.currentConfidenceLevels }; // Initialize confidence levels from dataset
      return acc;
    }, {} as ConfidenceLevelsState) // Initial state must match the defined type
  );

  // State to store selected model version keys for each section
  const [selectedKeys, setSelectedKeys] = useState<Record<number, string>>(
    sections.reduce((acc, section, index) => {
      acc[index] = section.configs.currentModelVersion; // Store the currentModelVersion as the default key
      return acc;
    }, {} as Record<number, string>)
  );

  // State to store details for each section based on selected model version
  const [selectedDetails, setSelectedDetails] = useState<Record<number, any>>(
    sections.reduce((acc, section, index) => {
      acc[index] = section.configs.modelVersions[0].details; // Initialize with the first model version's details
      return acc;
    }, {} as Record<number, any>)
  );

  // Handler for confidence level input change
  const handleConfidenceLevelChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, level: string) => {
    const value = parseFloat(e.target.value);
    if (value >= 0 && value <= 1) {
      setConfidenceLevels((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          [level]: value,
        },
      }));
    }
  };

  // Handler for select change (key-based)
  const handleSelectChange = (selectedKey: string | null, index: number) => {
    if (selectedKey) {
      setSelectedKeys((prev) => ({ ...prev, [index]: selectedKey }));

      // Update selected details based on the selected model version
      const selectedModelVersion = sections[index].configs.modelVersions.find((version) => version.modelVersion === selectedKey);
      if (selectedModelVersion) {
        setSelectedDetails((prev) => ({ ...prev, [index]: selectedModelVersion.details }));

        // Set the confidence levels to the defaults of the selected model version
        setConfidenceLevels((prev) => ({
          ...prev,
          [index]: { ...selectedModelVersion.defaults.confidenceLevels }, // Use defaults from selected model version
        }));
      }
    }
  };

  // Function to render details (handles nested objects)
  const renderDetails = (details: any) => {
    if (!details || Object.keys(details).length === 0) {
      return <p>No details available.</p>;
    }
    return (
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(details, null, 2)}
      </pre>
    );
  };

  return (
    <Accordion selectionMode="multiple" isCompact>
      {sections.map((section, index) => (
        <AccordionItem
          key={index}
          title={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p>{section.moduleId}</p>
              <Switch defaultSelected />
            </div>
          }
          subtitle={section.configs.currentModelVersion}
        >

          {/* Select Box with Controlled Selected Key */}
          <Select

            items={section.configs.modelVersions}
            selectedKeys={new Set([selectedKeys[index]])}
            onSelectionChange={(keys) => {
              const newSelectedKey = Array.from(keys)[0]; // Convert keys to an array and get the first key
              if (typeof newSelectedKey === 'string') {
                handleSelectChange(newSelectedKey, index);
              }
            }}
            label="Model versions"
            placeholder="Select a model version"
            className="max-w-xs"
          >

            {section.configs.modelVersions.map((v) => (
              <SelectItem key={v.modelVersion} textValue={v.modelVersion} value={v.modelVersion}>
                {v.modelVersion}
              </SelectItem>
            ))}
          </Select>
          {/* Input fields for confidence levels */}
          <div>
            <p>CONFIDENCE LEVELS:</p>
            {Object.keys(section.configs.currentConfidenceLevels).map((level) => {
              const defaultConfidenceLevel = sections[index].configs.modelVersions.find(v => v.modelVersion === selectedKeys[index])?.defaults.confidenceLevels[level as keyof ConfidenceLevels];

              return (
                <div key={level} style={{ marginBottom: "10px" }}>
                  <label htmlFor={`${level}-${index}`}>{level}: </label>
                  <Input
                    id={`${level}-${index}`}
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    className="max-w-xs"
                    value={confidenceLevels[index][level as keyof ConfidenceLevels].toString()} // This is now type-safe
                    onChange={(e) => handleConfidenceLevelChange(e, index, level as keyof ConfidenceLevels)} // Cast to keyof
                    style={{ marginLeft: "10px", width: "100px" }} // Adjust width as needed
                  />
                  {/* Display default confidence level */}
                  <span style={{ marginLeft: "10px", color: "gray" }}>
                    (Default: {defaultConfidenceLevel})
                  </span>
                </div>
              );
            })}
          </div>
          {/* Card to display details */}
          <Card>
            <CardBody>
              <ScrollShadow style={{ maxHeight: 300 }} size={0}>
                <p className="pl-2 text-sm">Details:</p>
                {renderDetails(selectedDetails[index])} {/* Displaying the details field based on selected model version */}
              </ScrollShadow>
            </CardBody>
          </Card>
        </AccordionItem>
      ))}
    </Accordion>
  );
}