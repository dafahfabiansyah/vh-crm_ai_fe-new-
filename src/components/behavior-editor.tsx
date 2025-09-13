import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, Zap, Code, Bold, Italic } from "lucide-react";

interface BehaviorEditorProps {
  value: string;
  onChange: (value: string) => void;
  activatedIntegrations?: Array<{
    id_integration: string;
    integration_name: string;
    is_enabled: boolean;
    custom_integration_fields?: any;
  }>;
  maxLength?: number;
  className?: string;
}

interface AutocompleteItem {
  id: string;
  name: string;
  description: string;
  custom_integration_fields?: any;
  uniqueKey?: string;
}

export function BehaviorEditor({
  value,
  onChange,
  activatedIntegrations = [],
  maxLength = 10000,
}: BehaviorEditorProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({
    top: 0,
    left: 0,
  });
  const [filteredIntegrations, setFilteredIntegrations] = useState<
    AutocompleteItem[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Convert activated integrations to autocomplete items
  const integrationItems: AutocompleteItem[] = activatedIntegrations
    .filter((integration) => integration.is_enabled)
    .map((integration, index) => {
      return {
        id: integration.integration_name.toLowerCase().replace(/\s+/g, "_"),
        name: integration.integration_name,
        description: `Integration: ${integration.integration_name}`,
        custom_integration_fields: integration.custom_integration_fields || {},
        uniqueKey: `activated_${integration.id_integration}_${index}`,
      };
    });

  // Use only activated integrations for this AI agent
  const allIntegrations = integrationItems;

  // Insert formatting helpers
  const insertFormatting = (format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        newText = selectedText ? `**${selectedText}**` : "**bold text**";
        cursorOffset = selectedText ? 0 : -9; // Position cursor before 'bold text'
        break;
      case "italic":
        newText = selectedText ? `*${selectedText}*` : "*italic text*";
        cursorOffset = selectedText ? 0 : -11;
        break;
      case "code":
        newText = selectedText ? `\`${selectedText}\`` : "`code`";
        cursorOffset = selectedText ? 0 : -5;
        break;
      case "integration":
        newText = "@int";
        cursorOffset = 0;
        break;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + newText.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const textarea = e.target;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPosition);

    // Check if user is typing @integration, @inte, or @int
    const integrationMatch = textBeforeCursor.match(
      /@int(?:e(?:gration)?)?:?([\w_]*)$/
    );

    if (integrationMatch) {
      const query = integrationMatch[1] || "";

      // Filter integrations based on query (search in both id and name)
      const filtered = allIntegrations.filter(
        (item) =>
          item.id.toLowerCase().includes(query.toLowerCase()) ||
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );

      setFilteredIntegrations(filtered);
      setSelectedIndex(0);

      if (filtered.length > 0) {
        // Create a temporary span to measure text width accurately
        const measureSpan = document.createElement("span");
        measureSpan.style.visibility = "hidden";
        measureSpan.style.position = "absolute";
        measureSpan.style.whiteSpace = "pre";
        measureSpan.style.font = getComputedStyle(textarea).font;
        document.body.appendChild(measureSpan);

        const rect = textarea.getBoundingClientRect();
        const style = getComputedStyle(textarea);
        const lineHeight = parseInt(style.lineHeight) || 20;
        const paddingLeft = parseInt(style.paddingLeft) || 0;
        const paddingTop = parseInt(style.paddingTop) || 0;

        // Calculate exact cursor position
        const lines = textBeforeCursor.split("\n");
        const currentLineIndex = lines.length - 1;
        const currentLineText = lines[currentLineIndex];

        // Measure the actual width of text before cursor on current line
        measureSpan.textContent = currentLineText;
        const textWidth = measureSpan.offsetWidth;

        // Clean up the measurement element
        document.body.removeChild(measureSpan);

        // Position dropdown right next to the cursor
        const topOffset =
          paddingTop + currentLineIndex * lineHeight + lineHeight + 5;
        const leftOffset = paddingLeft + textWidth + 5;

        // Ensure dropdown doesn't go off-screen
        const maxLeft = window.innerWidth - 400;
        const finalLeft = Math.min(rect.left + leftOffset, maxLeft);

        setAutocompletePosition({
          top: rect.top + topOffset + window.scrollY,
          left: finalLeft + window.scrollX,
        });

        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showAutocomplete || filteredIntegrations.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredIntegrations.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredIntegrations.length - 1
        );
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        insertIntegration(filteredIntegrations[selectedIndex]);
        break;
      case "Escape":
        setShowAutocomplete(false);
        break;
    }
  };

  const insertIntegration = (integration: AutocompleteItem) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);

    // Find the start of @integration:, @inte, or @int to replace
    const integrationMatch = textBeforeCursor.match(
      /@int(?:e(?:gration)?)?:?([\w_]*)$/
    );
    if (!integrationMatch) return;

    const matchStart = cursorPosition - integrationMatch[0].length;

    // Create the integration text with custom fields (only field names)
    let integrationText = `@integration:${integration.id}`;
    if (
      integration.custom_integration_fields &&
      Object.keys(integration.custom_integration_fields).length > 0
    ) {
      const fieldNames = Object.keys(integration.custom_integration_fields);
      const fieldsObject = fieldNames.reduce((acc, fieldName) => {
        acc[fieldName] = "";
        return acc;
      }, {} as any);
      const fieldsJson = JSON.stringify(fieldsObject, null, 2);
      integrationText += `\n${fieldsJson}`;
    }

    const newText =
      value.substring(0, matchStart) + integrationText + textAfterCursor;

    onChange(newText);
    setShowAutocomplete(false);

    // Set cursor position after the inserted text
    setTimeout(() => {
      const newCursorPosition = matchStart + integrationText.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      textarea.focus();
    }, 0);
  };

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header with help */}
      <div className="flex items-center justify-end">
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center space-x-1"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </Button> */}
      </div>

      {/* Help panel */}
      {showHelp && (
        <Card className="p-4 ">
          <h3 className="font-semibold mb-3">
            {/* How to write AI behavior instructions */}
            Instruksi untuk Membuat AI Behavior
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">
                Text Formatting
              </h4>
              <ul className="space-y-1 ">
                <li>• **bold text** for emphasis</li>
                <li>• *italic text* for subtle emphasis</li>
                <li>• `code text` for technical terms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">
                Add Integrations
              </h4>
              <ul className="space-y-1 ">
                <li>• Type @int to see available integrations</li>
                <li>• Use arrow keys to navigate</li>
                <li>• Press Enter or Tab to select</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="relative">
        {/* Formatting toolbar */}
        <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertFormatting("bold")}
            className="flex items-center space-x-1"
          >
            <Bold className="w-3 h-3" />
            <span className="text-xs">Bold</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertFormatting("italic")}
            className="flex items-center space-x-1"
          >
            <Italic className="w-3 h-3" />
            <span className="text-xs">Italic</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertFormatting("code")}
            className="flex items-center space-x-1"
          >
            <Code className="w-3 h-3" />
            <span className="text-xs">Code</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertFormatting("integration")}
            className="flex items-center space-x-1"
          >
            <Zap className="w-3 h-3" />
            <span className="text-xs">Integration</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center space-x-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </Button>
        </div>

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="behavior-textarea min-h-[200px] resize-none"
          maxLength={maxLength}
          placeholder="Describe the AI agent's behavior and use @integration: to add integrations..."
        />

        {/* Enhanced autocomplete dropdown */}
        {showAutocomplete && filteredIntegrations.length > 0 && (
          <Card
            ref={autocompleteRef}
            className="absolute z-50 w-96 max-h-72 overflow-y-auto border shadow-xl bg-white"
            style={{
              top: autocompletePosition.top,
              left: autocompletePosition.left,
            }}
          >
            <div className="p-3">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  Available Integrations
                </span>
                <Badge variant="outline" className="text-xs">
                  {filteredIntegrations.length} found
                </Badge>
              </div>
              {filteredIntegrations.map((integration, index) => (
                <div
                  key={integration.uniqueKey || `${integration.id}_${index}`}
                  className={`px-4 py-4 cursor-pointer rounded-lg transition-all duration-200 border ${
                    index === selectedIndex
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "hover:bg-gray-50 border-transparent"
                  }`}
                  onClick={() => insertIntegration(integration)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">
                          {integration.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          @integration:{integration.id}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600">
                      {integration.description}
                    </div>

                    {integration.custom_integration_fields &&
                      Object.keys(integration.custom_integration_fields)
                        .length > 0 && (
                        <div className="bg-gray-50 rounded-md p-3 border">
                          <div className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
                            <Code className="w-3 h-3" />
                            <span>Custom Fields</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.keys(
                              integration.custom_integration_fields
                            ).map((fieldName, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-mono"
                              >
                                {fieldName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-2 border-t text-xs text-gray-500">
                💡 Use ↑↓ to navigate, Enter to select, Esc to close
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Character count */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {value.length} / {maxLength} characters
        </span>
        <span>{allIntegrations.length} integrations available</span>
      </div>

      <style>{`
         .behavior-textarea {
          //  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
           font-size: 14px;
          //  line-height: 1.6;
          //  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
           border: 2px solid #e2e8f0;
           border-radius: 12px;
           padding: 16px;
           transition: all 0.2s ease;
         }
         .behavior-textarea:focus {
          //  border-color: #3b82f6;
          //  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
           background: #ffffff;
         }
         .integration-highlight {
           background: linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%);
           border-radius: 6px;
           padding: 2px 6px;
           font-weight: 600;
           color: #5b21b6;
         }
         .integration-block {
           display: inline-block;
           margin: 8px 0;
           border: 1px solid #e2e8f0;
           border-radius: 8px;
           background: #f8fafc;
           padding: 12px;
           box-shadow: 0 1px 3px rgba(0,0,0,0.1);
         }
         .integration-tag {
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           color: white;
           padding: 6px 12px;
           border-radius: 6px;
           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           font-size: 0.85em;
           font-weight: 500;
           display: inline-flex;
           align-items: center;
           gap: 4px;
           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
           margin-bottom: 8px;
         }
         .integration-json {
           background: #1f2937;
           color: #f3f4f6;
           padding: 12px;
           border-radius: 6px;
           font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
           font-size: 0.8em;
           line-height: 1.4;
           margin-top: 8px;
           overflow-x: auto;
           border: 1px solid #374151;
         }
         .prose {
           line-height: 1.6;
         }
         .prose p {
           margin-bottom: 1em;
         }
         .prose strong {
           font-weight: 600;
         }
       `}</style>
    </div>
  );
}
