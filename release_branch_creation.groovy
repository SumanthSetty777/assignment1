pipeline{
    agent any
    stages{
        stage("Branch_Creation"){
            steps{
              
              script{
                  def arr = ["assignment1", "vedx"]
                  
                  for(repo in arr){
                    
                        echo "Testing the $repo browser"
                        sh "git clone https://SumanthSetty777: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@github.com/SumanthSetty777/${repo}.git"
                        sh "cd $WORKSPACE/$repo && git checkout -b Test"    
                        sh("cd $WORKSPACE/$repo && git push origin Test")   
                        
                    
                    }
        
                }
            }
        }
    }
}
