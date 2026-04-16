import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let isPermissionError = false;
      let errorData = null;

      try {
        if (this.state.error?.message) {
          errorData = JSON.parse(this.state.error.message);
          isPermissionError = true;
        }
      } catch (e) {
        // Not a JSON error, normal error handling
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {isPermissionError 
                  ? "You don't have permission to perform this action or access this data."
                  : "Something went wrong while loading the application."}
              </p>
              {this.state.error && !isPermissionError && (
                <div className="bg-muted p-3 rounded-md overflow-auto max-h-32">
                  <code className="text-xs">{this.state.error.toString()}</code>
                </div>
              )}
              {isPermissionError && errorData && (
                <div className="bg-muted p-3 rounded-md">
                   <p className="text-xs font-mono">Operation: {errorData.operationType}</p>
                   <p className="text-xs font-mono">Path: {errorData.path}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={this.handleReset} className="w-full flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Application
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
