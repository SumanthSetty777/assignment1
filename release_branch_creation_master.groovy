#!/usr/bin/env groovy

pipelineJob('release_branch_creation') {
    displayName('release_branch_creation')
    description('This Jenkins job creates a new branch for release')
     properties {
           githubProjectUrl('https://github.com/reputation/build_tools')
           disableConcurrentBuilds()
        }
    logRotator {
        daysToKeep(3)
    }

    configure { project ->
        project / 'properties' / 'org.jenkinsci.plugins.workflow.job.properties.DurabilityHintJobProperty' {
            hint('PERFORMANCE_OPTIMIZED')
        }
    }

    definition {
        cpsScm {
            scm {
                git {
                    remote {
                        url('git@github.com:reputation/build_tools.git')
                        credentials('rdc-jenkins')
                    }
                    branches('master')
                }
            }
            // triggers{
            //   githubPush()
            //   pollSCM {
            //         scmpoll_spec('H/5 * * * *')
            //   }

            // }
            scriptPath('jenkinsfiles-kubernetes/release_branch_creation.groovy')
        }
    }
}