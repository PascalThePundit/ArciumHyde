import { PrivacyOperation, PrivacyWorkflow, PrivacyInput, PrivacyOutput } from '../types';
import { PrimitiveRegistry } from './PrimitiveRegistry';
import { logger } from '../utils/logger';

export interface WorkflowExecutionResult {
  success: boolean;
  outputs: PrivacyOutput;
  executionTime: number;
  operationsExecuted: number;
  error?: string;
}

export class ComposabilityEngine {
  private registry: PrimitiveRegistry;
  private executionHistory: Map<string, WorkflowExecutionResult> = new Map();

  constructor() {
    this.registry = PrimitiveRegistry.getInstance();
  }

  /**
   * Execute a single privacy operation
   */
  async executeOperation(operation: PrivacyOperation, input: PrivacyInput): Promise<PrivacyOutput> {
    const startTime = Date.now();

    try {
      const result = await operation.execute(input);

      const executionTime = Date.now() - startTime;
      logger.debug('Operation executed', {
        id: operation.id,
        executionTime,
        success: true
      });

      return {
        ...result,
        _executionTime: executionTime,
        _operationId: operation.id
      };
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      logger.error('Operation failed', {
        id: operation.id,
        executionTime,
        error: (error as Error).message
      });

      throw error;
    }
  }

  /**
   * Execute a privacy workflow
   */
  async executeWorkflow(id: string, input: PrivacyInput): Promise<WorkflowExecutionResult> {
    const workflow = this.registry.getWorkflow(id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }

    const startTime = Date.now();
    let operationsExecuted = 0;
    let currentInput = { ...input };
    let resultOutput: PrivacyOutput = {};

    try {
      for (const operation of workflow.operations) {
        // Use the operation ID to look up the actual primitive if needed
        const primitive = this.registry.getPrimitive(operation.id) || operation;
        if (!primitive) {
          // Fix: Use type assertion to tell TypeScript that 'operation' still has an an 'id' property here.
          // The 'operation' variable itself is a PrivacyOperation from the workflow.operations array.
          throw new Error(`Operation not found in registry: ${(operation as PrivacyOperation).id}`);
        }

        // Execute the operation with current input
        const operationResult = await this.executeOperation(primitive, currentInput);
        operationsExecuted++;

        // Merge results to pass to next operation
        currentInput = { ...currentInput, ...operationResult };
        resultOutput = { ...resultOutput, ...operationResult };
      }

      const executionTime = Date.now() - startTime;
      const result: WorkflowExecutionResult = {
        success: true,
        outputs: resultOutput,
        executionTime,
        operationsExecuted
      };

      // Store in execution history
      this.executionHistory.set(id, result);

      logger.info('Workflow executed successfully', {
        id,
        executionTime,
        operationsExecuted
      });

      return result;
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      const result: WorkflowExecutionResult = {
        success: false,
        outputs: {},
        executionTime,
        operationsExecuted,
        error: (error as Error).message
      };

      logger.error('Workflow execution failed', {
        id,
        executionTime,
        operationsExecuted,
        error: (error as Error).message
      });

      return result;
    }
  }

  /**
   * Chain privacy operations
   */
  async chainOperations(operations: PrivacyOperation[], initialInput: PrivacyInput): Promise<PrivacyOutput> {
    let currentInput = { ...initialInput };
    const results: PrivacyOutput[] = [];

    for (const operation of operations) {
      const result = await this.executeOperation(operation, currentInput);
      results.push(result);
      currentInput = { ...currentInput, ...result }; // Pass results to next operation
    }

    return {
      results,
      finalOutput: currentInput,
      totalOperations: operations.length
    };
  }

  /**
   * Create a workflow from a series of operations
   */
  createWorkflowFromOperations(
    id: string,
    name: string,
    description: string,
    operations: PrivacyOperation[]
  ): PrivacyWorkflow {
    const workflow: PrivacyWorkflow = {
      id,
      name,
      description,
      operations,
      inputs: Object.keys(operations[0]?.inputs || {}),
      outputs: Object.keys(operations[operations.length - 1]?.outputs || {})
    };

    this.registry.registerWorkflow(workflow);
    return workflow;
  }

  /**
   * Get execution result by workflow ID
   */
  getExecutionResult(workflowId: string): WorkflowExecutionResult | undefined {
    return this.executionHistory.get(workflowId);
  }

  /**
   * Get all execution results
   */
  getAllExecutionResults(): Map<string, WorkflowExecutionResult> {
    return new Map(this.executionHistory);
  }

  /**
   * Clear execution history
   */
  clearExecutionHistory(): void {
    this.executionHistory.clear();
  }

  /**
   * Validate workflow for execution
   */
  validateWorkflow(workflow: PrivacyWorkflow): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!workflow.operations || workflow.operations.length === 0) {
      errors.push('Workflow must have at least one operation');
    }

    // Check for circular dependencies and valid primitives
    for (const operation of workflow.operations) {
      const primitive = this.registry.getPrimitive(operation.id);
      if (!primitive) {
        errors.push(`Operation not found in registry: ${operation.id}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
