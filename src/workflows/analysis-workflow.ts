import { Workflow } from "cloudflare:workers";

export interface AnalysisWorkflowInput {
  code: string;
  language?: string;
  analysisTypes: ('security' | 'performance' | 'quality')[];
  sessionId: string;
  userId?: string;
}

export interface AnalysisWorkflowOutput {
  sessionId: string;
  analysisId: string;
  results: {
    security?: any;
    performance?: any;
    quality?: any;
  };
  summary: {
    totalIssues: number;
    criticalIssues: number;
    recommendations: string[];
  };
  completedAt: number;
}

/**
 * Cloudflare Workflow for complex code analysis tasks
 */
export class AnalysisWorkflow extends Workflow {
  async run(input: AnalysisWorkflowInput): Promise<AnalysisWorkflowOutput> {
    const analysisId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      await this.initializeAnalysisSession(input.sessionId, analysisId);

      const analysisResults = await this.performParallelAnalysis(input);

      const summary = await this.generateSummary(analysisResults);

      await this.storeAnalysisResults(input.sessionId, analysisId, analysisResults, summary);

      await this.sendNotifications(input, analysisResults, summary);

      return {
        sessionId: input.sessionId,
        analysisId,
        results: analysisResults,
        summary,
        completedAt: Date.now(),
      };

    } catch (error) {
      console.error('Analysis workflow failed:', error);
      
      // Store error state
      await this.storeErrorState(input.sessionId, analysisId, error as Error);
      
      throw new Error(`Analysis workflow failed: ${(error as Error).message}`);
    }
  }

  private async initializeAnalysisSession(sessionId: string, analysisId: string): Promise<void> {
    console.log(`Initializing analysis session: ${sessionId}, analysis: ${analysisId}`);

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async performParallelAnalysis(input: AnalysisWorkflowInput): Promise<any> {
    const { code, analysisTypes } = input;
    const results: any = {};

    const tasks: Promise<any>[] = [];

    if (analysisTypes.includes('security')) {
      tasks.push(this.analyzeSecurity(code));
    }

    if (analysisTypes.includes('performance')) {
      tasks.push(this.analyzePerformance(code));
    }

    if (analysisTypes.includes('quality')) {
      tasks.push(this.analyzeQuality(code));
    }

    const analysisResults = await Promise.allSettled(tasks);

    // Process results
    let index = 0;
    if (analysisTypes.includes('security')) {
      results.security = analysisResults[index].status === 'fulfilled' 
        ? analysisResults[index].value 
        : { error: 'Security analysis failed' };
      index++;
    }

    if (analysisTypes.includes('performance')) {
      results.performance = analysisResults[index].status === 'fulfilled' 
        ? analysisResults[index].value 
        : { error: 'Performance analysis failed' };
      index++;
    }

    if (analysisTypes.includes('quality')) {
      results.quality = analysisResults[index].status === 'fulfilled' 
        ? analysisResults[index].value 
        : { error: 'Quality analysis failed' };
    }

    return results;
  }

  private async analyzeSecurity(code: string): Promise<any> {
    console.log('Performing security analysis...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      vulnerabilities: [
        {
          type: 'SQL Injection',
          severity: 'high',
          line: 15,
          description: 'Potential SQL injection vulnerability detected',
          recommendation: 'Use parameterized queries'
        }
      ],
      score: 75,
      summary: 'Found 1 high-severity security issue'
    };
  }

  private async analyzePerformance(code: string): Promise<any> {
    console.log('Performing performance analysis...');

    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      issues: [
        {
          type: 'N+1 Query Problem',
          severity: 'medium',
          line: 23,
          description: 'Potential N+1 query issue in loop',
          recommendation: 'Use eager loading or batch queries'
        }
      ],
      score: 80,
      summary: 'Found 1 performance optimization opportunity'
    };
  }

  private async analyzeQuality(code: string): Promise<any> {
    console.log('Performing quality analysis...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      issues: [
        {
          type: 'Code Complexity',
          severity: 'low',
          line: 8,
          description: 'Function complexity is high',
          recommendation: 'Consider breaking into smaller functions'
        }
      ],
      score: 85,
      summary: 'Code quality is good with minor improvements needed'
    };
  }

  private async generateSummary(results: any): Promise<any> {
    console.log('Generating analysis summary...');

    const allIssues: any[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    Object.values(results).forEach((result: any) => {
      if (result && !result.error) {
        if (result.vulnerabilities) allIssues.push(...result.vulnerabilities);
        if (result.issues) allIssues.push(...result.issues);
        if (result.score) {
          totalScore += result.score;
          scoreCount++;
        }
      }
    });

    const criticalIssues = allIssues.filter(issue => issue.severity === 'high' || issue.severity === 'critical');
    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    return {
      totalIssues: allIssues.length,
      criticalIssues: criticalIssues.length,
      averageScore,
      recommendations: [
        'Review and fix critical security issues first',
        'Optimize performance bottlenecks',
        'Improve code maintainability'
      ]
    };
  }

  private async storeAnalysisResults(
    sessionId: string,
    analysisId: string,
    results: any,
    summary: any
  ): Promise<void> {
    console.log(`Storing analysis results for session: ${sessionId}`);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async sendNotifications(
    input: AnalysisWorkflowInput,
    results: any,
    summary: any
  ): Promise<void> {
    console.log('Sending analysis notifications...');

    if (summary.criticalIssues > 0) {
      console.log(`⚠️ Critical issues found: ${summary.criticalIssues}`);
    }
  }

  private async storeErrorState(sessionId: string, analysisId: string, error: Error): Promise<void> {
    console.error(`Storing error state for session: ${sessionId}, analysis: ${analysisId}`);

    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Export the workflow for use in the main worker
export default AnalysisWorkflow;
