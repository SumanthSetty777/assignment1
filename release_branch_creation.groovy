pipeline{
    agent any
    stages{
        stage("Branch_Creation"){
            steps{
              
              script{
                  def arr = ["r4e-ops-test", "r4e-demo-tenant"]
                  
                  for(repo in arr){
                    
                        echo "Testing the $repo browser"
                        sh "git clone https://sumanthsetty78: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@github.com/reputation/${repo}.git"
                        sh "cd $WORKSPACE/$repo && git checkout -b Test"    
                        sh("cd $WORKSPACE/$repo && git push origin Test")   
                        
                    
                    }
        
                }
            }
        }
    }
}