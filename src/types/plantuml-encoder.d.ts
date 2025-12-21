declare module 'plantuml-encoder' {
  /**
   * Encode PlantUML code to PlantUML server format
   * @param plantUMLCode PlantUML source code
   * @returns Encoded string for PlantUML server URL
   */
  function encode(plantUMLCode: string): string;

  /**
   * Decode PlantUML server format to PlantUML code
   * @param encoded Encoded string from PlantUML server URL
   * @returns Decoded PlantUML source code
   */
  function decode(encoded: string): string;

  export { encode, decode };
  export default { encode, decode };
}
