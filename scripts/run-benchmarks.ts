// scripts/run-benchmarks.ts - Performance validation script
import { EncryptionService } from '../server/src/services/EncryptionService';
import { EncryptionCache } from '../server/src/services/cache';
import { RequestQueue } from '../server/src/services/RequestQueue';
import { WasmCryptoService } from '../server/src/services/WasmCryptoService';
import { PerformanceService } from '../server/src/services/PerformanceService';

interface BenchmarkResult {
  testName: string;
  operation: string;
  iterations: number;
  totalTime: number; // in ms
  avgTime: number; // in ms
  minTime: number; // in ms
  maxTime: number; // in ms
  opsPerSecond: number;
  memoryUsed: number; // in MB
  successRate: number;
}

class PerformanceBenchmarkRunner {
  private results: BenchmarkResult[] = [];

  async runAllBenchmarks(): Promise<void> {
    console.log('🚀 Starting performance benchmark validation...\n');

    // Before optimizations benchmarks
    console.log('📊 Running BEFORE optimization benchmarks...');
    const beforeResults = await this.runBenchmarkSuite('BEFORE');
    
    // Initialize optimizations
    console.log('\n⚙️  Initializing optimizations...');
    await this.initializeOptimizations();
    
    // After optimizations benchmarks
    console.log('\n📈 Running AFTER optimization benchmarks...');
    const afterResults = await this.runBenchmarkSuite('AFTER');
    
    // Compare and show improvements
    this.compareResults(beforeResults, afterResults);
    
    console.log('\n✅ Performance benchmark validation completed!');
  }

  private async runBenchmarkSuite(suiteName: string): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    
    // Benchmark 1: Encryption performance
    const encryptResult = await this.benchmarkOperation('encryption', suiteName);
    results.push(encryptResult);
    
    // Benchmark 2: Decryption performance
    const decryptResult = await this.benchmarkOperation('decryption', suiteName);
    results.push(decryptResult);
    
    // Benchmark 3: Batch operations
    const batchResult = await this.benchmarkBatchOperations(suiteName);
    results.push(batchResult);
    
    // Benchmark 4: Concurrent operations
    const concurrentResult = await this.benchmarkConcurrentOperations(suiteName);
    results.push(concurrentResult);
    
    console.log(`\n${suiteName} Results:`);
    results.forEach(result => {
      console.log(`  ${result.testName}: ${result.avgTime.toFixed(2)}ms avg (${result.opsPerSecond.toFixed(2)} ops/sec)`);
    });
    
    return results;
  }

  private async benchmarkOperation(operation: string, suiteName: string): Promise<BenchmarkResult> {
    const iterations = 50; // Reduced for faster testing
    const times: number[] = [];
    let successCount = 0;
    
    const startMemory = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        if (operation === 'encryption') {
          await EncryptionService.encrypt(`benchmark_data_${i}`, 'aes256', undefined, 'benchmark_password');
          successCount++;
        } else if (operation === 'decryption') {
          // First encrypt something to decrypt
          const encrypted = await EncryptionService.encrypt(`benchmark_data_${i}`, 'aes256', undefined, 'benchmark_password');
          await EncryptionService.decrypt(encrypted, 'aes256', undefined, 'benchmark_password');
          successCount++;
        }
      } catch (error) {
        console.error(`Operation failed at iteration ${i}:`, error);
      }
      
      const endTime = Date.now();
      times.push(endTime - startTime);
    }
    
    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // Convert to MB
    
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = iterations / (totalTime / 1000);
    const successRate = successCount / iterations;
    
    return {
      testName: `${operation}_${suiteName}`.toLowerCase(),
      operation,
      iterations,
      totalTime,
      avgTime,
      minTime,
      maxTime,
      opsPerSecond,
      memoryUsed,
      successRate
    };
  }

  private async benchmarkBatchOperations(suiteName: string): Promise<BenchmarkResult> {
    const iterations = 10; // Number of batch operations
    const batchSize = 20; // Operations per batch
    const times: number[] = [];
    let successCount = 0;
    
    const startMemory = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        // Create batch operations
        const operations = Array.from({ length: batchSize }, (_, idx) => ({
          data: `batch_data_${i}_${idx}`,
          method: 'aes256',
          password: 'benchmark_password'
        }));
        
        await EncryptionService.encryptBatch(operations);
        successCount++;
      } catch (error) {
        console.error(`Batch operation failed at iteration ${i}:`, error);
      }
      
      const endTime = Date.now();
      times.push(endTime - startTime);
    }
    
    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // Convert to MB
    
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = (iterations * batchSize) / (totalTime / 1000);
    const successRate = successCount / iterations;
    
    return {
      testName: `batch_encryption_${suiteName}`.toLowerCase(),
      operation: 'batch_encryption',
      iterations: iterations * batchSize,
      totalTime,
      avgTime,
      minTime,
      maxTime,
      opsPerSecond,
      memoryUsed,
      successRate
    };
  }

  private async benchmarkConcurrentOperations(suiteName: string): Promise<BenchmarkResult> {
    const operationCount = 50;
    const startTime = Date.now();
    let successCount = 0;
    
    const startMemory = process.memoryUsage().heapUsed;
    
    // Run all operations concurrently
    const promises = Array.from({ length: operationCount }, async (_, idx) => {
      try {
        await EncryptionService.encrypt(`concurrent_data_${idx}`, 'aes256', undefined, 'benchmark_password');
        successCount++;
      } catch (error) {
        console.error(`Concurrent operation failed at index ${idx}:`, error);
      }
    });
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const memoryUsed = (process.memoryUsage().heapUsed - startMemory) / 1024 / 1024; // Convert to MB
    const avgTime = totalTime / operationCount;
    const opsPerSecond = operationCount / (totalTime / 1000);
    const successRate = successCount / operationCount;
    
    // For concurrent operations, we'll use totalTime as the effective time
    // since operations are running in parallel
    return {
      testName: `concurrent_operations_${suiteName}`.toLowerCase(),
      operation: 'concurrent_encryption',
      iterations: operationCount,
      totalTime,
      avgTime,
      minTime: avgTime, // Approximation
      maxTime: avgTime, // Approximation
      opsPerSecond,
      memoryUsed,
      successRate
    };
  }

  private async initializeOptimizations(): Promise<void> {
    // Initialize caching
    const cache = EncryptionCache.getInstance();
    console.log('✅ Encryption cache initialized');
    
    // Initialize request queue
    const queue = RequestQueue.getInstance(10); // 10 concurrent operations
    console.log('✅ Request queue initialized (10 concurrent)');
    
    // Initialize WASM crypto service
    const wasmService = WasmCryptoService.getInstance();
    await wasmService.initialize();
    console.log('✅ WASM crypto service initialized');
  }

  private compareResults(before: BenchmarkResult[], after: BenchmarkResult[]): void {
    console.log('\n🏆 PERFORMANCE IMPROVEMENT SUMMARY:');
    console.log('==================================');
    
    before.forEach((beforeResult, idx) => {
      const afterResult = after[idx];
      
      if (beforeResult && afterResult) {
        const timeImprovement = ((beforeResult.avgTime - afterResult.avgTime) / beforeResult.avgTime) * 100;
        const throughputImprovement = ((afterResult.opsPerSecond - beforeResult.opsPerSecond) / beforeResult.opsPerSecond) * 100;
        
        console.log(`\n${beforeResult.operation}:`);
        console.log(`  Time: ${beforeResult.avgTime.toFixed(2)}ms → ${afterResult.avgTime.toFixed(2)}ms (${timeImprovement > 0 ? '+' : ''}${timeImprovement.toFixed(2)}%)`);
        console.log(`  Throughput: ${beforeResult.opsPerSecond.toFixed(2)} → ${afterResult.opsPerSecond.toFixed(2)} ops/sec (${throughputImprovement > 0 ? '+' : ''}${throughputImprovement.toFixed(2)}%)`);
        console.log(`  Success Rate: ${(beforeResult.successRate * 100).toFixed(2)}% → ${(afterResult.successRate * 100).toFixed(2)}%`);
      }
    });
    
    // Overall summary
    const totalBeforeTime = before.reduce((sum, r) => sum + r.avgTime, 0);
    const totalAfterTime = after.reduce((sum, r) => sum + r.avgTime, 0);
    const overallTimeImprovement = ((totalBeforeTime - totalAfterTime) / totalBeforeTime) * 100;
    
    console.log('\n📊 OVERALL IMPROVEMENT:');
    console.log(`  Average execution time reduced by: ${overallTimeImprovement > 0 ? '+' : ''}${overallTimeImprovement.toFixed(2)}%`);
  }
}

// Run the benchmark
const runner = new PerformanceBenchmarkRunner();
runner.runAllBenchmarks()
  .catch(error => {
    console.error('Benchmark failed:', error);
    process.exit(1);
  });